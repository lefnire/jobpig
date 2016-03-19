'use strict';
process.env.wipe = true; // fresh db

const _ = require('lodash');
const expect = require('expect.js');
const request = require('supertest-as-promised');
const Sequelize = require('sequelize');
const app = require('../index');
const nconf = require('nconf');
const jobsController = require('../controllers/jobs');
const mail = require('../lib/mail');
let db;

let oldReqs = _.reduce(['http','https'], (m,v)=>{m[v]=require(v).request;return m}, {});
let revertSepia = ()=>
  ['http','https'].forEach(protocol=> require(protocol).request=oldReqs[protocol]);

describe('Jobpig', function() {
  this.timeout(0);
  let users = {good: null, bad: null, employer: null},
    jwts = {},
    agent,
    jobPost;

  before(done => {
    db = require('../models/models');
    db.syncPromise.then(() => {
      // register 2 users, 1 employer
      agent = request(app);
      return Promise.all(
        _.keys(users).map(k =>
        agent.post('/register').send({email: `${k}@x.com`, password:'1234',confirmPassword:'1234'})
        .expect(200).then(res => {
          jwts[k] = res.body.token;
          return Promise.resolve();
        }))
      ).then(() => db.User.findAll())
      .then(_users => {
        //store users in closure {good:[Object], bad:[Object], employer:[Object]}
        users = _.reduce(_.keys(users), (m, k) => {
          m[k] = _.find(_users, {email: `${k}@x.com`});
          return m;
        }, {});
        done();
      })
    })
  });

  it('registration rejects invalid stuff', done => {
    agent.post('/register').send({email: `good@x.com`, password: '1234', confirmPassword: '1234'}).expect(403)
    .then(() =>
      agent.post('/register').send({email: `new@x.com`, password: 'a', confirmPassword: 'a'}).expect(403)
    ).then(() =>
      agent.post('/register').send({email: `new`, password: '1234', confirmPassword: '1234'}).expect(403)
    ).then(() =>
      db.User.count()
    ).then(ct => {
      expect(ct).to.be(3); // didn't create new user
      done();
    });
  })

  it('email', done => {
    mail.testEmail = true;
    //nconf.set('NODE_ENV', 'development'); // emails are disabled when NODE_ENV=test FIXME this isn't setting anything??
    agent.post('/register').send({email: 'tylerrenelle@gmail.com', password: '1234', confirmPassword: '1234'}).expect(200)
    .then(() => agent.post('/user/forgot-password').send({email: 'tylerrenelle@gmail.com'}).expect(403))
    .then(() => db.User.update({verified: true}, {where: {email: 'tylerrenelle@gmail.com'}}))
    .then(() => agent.post('/user/forgot-password').send({email: 'tylerrenelle@gmail.com'}).expect(200))
    .then(() => {
      done();
      mail.testEmail = false;
      expect('user cannot email others without validated email').to.be(true);
    })
  });

  it('updates profile fields', done => {
    let body = _.clone(users.good.toJSON());
    let url = 'http://x.com';
    _.assign(body, {email: 'dont@update.com', password: 'dontUpdate', fullname: 'x', pic: url, linkedin_url: url, github_url: url, twitter_url: url, bio: 'x'})
    agent.put('/user').set('x-access-token', jwts.good).send(body).expect(200)
      .then(json => {
        let updated = json.body;
        expect(updated.email).to.be(users.good.email);
        expect(updated.fullname).to.be('x');
        expect(updated.pic).to.be(url);
        expect(updated.linkedin_url).to.be(url);
        expect(updated.github_url).to.be(url);
        expect(updated.twitter_url).to.be(url);
        expect(updated.bio).to.be('x');
        done();
      })
  });


  //after(app.close)
  it.skip('runs cron', done => {
    //process.env.VCR_MODE = 'playback';
    //let sepia = require('sepia');

    let numJobs;
    db.Meta.needsCron()
    .then(val => {
      expect(val).to.be(true);
      return db.Meta.runCronIfNecessary();
    })
    .then(() => db.Job.count())
    .then(_numJobs => {
      numJobs = _numJobs;
      expect(numJobs).to.be.greaterThan(0);
    })
    .then(() =>
      // Make sure they all got tags (they should at least have jobboard source, and maybe remote)
      sequelize.query(`
        SELECT j.*, json_agg(tags) tags
        FROM jobs j
        LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
        GROUP BY j.id
      `, {type: sequelize.QueryTypes.SELECT })
      //sequelize.query('SELECT COUNT(DISTINCT id) FROM jobs INNER JOIN job_tags ON job_tags.job_id = jobs.id', { type: sequelize.QueryTypes.SELECT})
    )
    .then(jobs => {

      let hasTags = j => j.tags.length >= 1;
      let onlyOneNonTagAttr = j => _.reduce([2,3,4], (m,type) => m && _.filter(j.tags, {type}).length<=1, true);
      expect(numJobs).to.be(_.filter(jobs, hasTags).length);
      expect(numJobs).to.be(_.filter(jobs, onlyOneNonTagAttr).length);
      //revertSepia();
      done();
    })
  });

  it('posts & lists my job postings', done => {
    // Create custom job post
    agent.post('/jobs')
      .set('x-access-token', jwts.employer)
      .send({title: 'title1', description: 'description1', tags: 'javascript,jquery,angular,node'})
      .expect(200)
    // and create another, to check duplication errors
    .then(() => agent.post('/jobs')
      .set('x-access-token', jwts.employer)
      .send({title: 'title2', description: 'description2', tags: 'javascript,jquery,angular,node'})
      .expect(200))
    .then(() => db.Job.findOne({where:{title:'title1'}, include:[db.Tag]}))

    // users upvote / downvote the posting
    .then(_job=> {
      jobPost = _job;
      return Promise.all(
        jobPost.tags.map(t => users.bad.addTag(t, {score:-10}) ).concat(
          jobPost.tags.map(t => users.good.addTag(t, {score:+10}) )
        )
      )
    })

    // Get the employer's results
    .then(() => agent.get('/jobs/mine').set('x-access-token', jwts.employer).expect(200))
    .then(res => {
      let jobs = res.body;
      expect(jobs[0].users.length).to.be(1);
      expect(jobs[0].users[0].id).to.be(users.good.id);
      //expect(jobs[0].users[0].score).to.be(70);
      done();
    }).catch(done);
  });


  it.skip('messages', function(done){
    const reply = (mid, jwt, body) => agent.post(`/messages/reply/${mid}`)
      .set('x-access-token', jwt).send({body}).expect(200);
    // Initial contact
    agent.post(`/messages/contact/${users.good.id}`)
      .set('x-access-token', jwts.employer)
      .send({subject:"Hello", body: "I have a job for you"})
      .expect(200)
    // 3 replies
    .then(res => reply(res.body.id, jwts.good, "I'd like to hear more"))
    .then(res => reply(res.body.message_id, jwts.employer, "Contact me at employer@x.com"))
    .then(res => reply(res.body.message_id, jwts.good, "Will do!"))
     // They all went through
    .then(() => Promise.all([
      agent.get(`/messages`).set('x-access-token', jwts.good).expect(200),
      agent.get(`/messages`).set('x-access-token', jwts.employer).expect(200)
    ]))
    .then(vals => {
      expect(vals[0].body.length).to.be(1);
      expect(vals[1].body.length).to.be(1);
      expect(vals[0].body[0].replies.length).to.be(3); // replies

      let _users = _.map(vals[0].body[0].users, 'id');
      expect(_users).to.contain(users.good.id);
      expect(_users).to.contain(users.employer.id);

      // Then delete
      return agent.delete(`/messages/${vals[0].body[0].id}`).set('x-access-token', jwts.good).expect(200);
    }).then(() => Promise.all([
      agent.get(`/messages`).set('x-access-token', jwts.good).expect(200),
      agent.get(`/messages`).set('x-access-token', jwts.employer).expect(200)
    ]))
    .then(vals => {
      expect(vals[0].body.length).to.be(0); // deleted message for recipient
      expect(vals[1].body.length).to.be(1); // but not for employer
      return Promise.resolve();
    })
    .then(done).catch(done);
  })

})
