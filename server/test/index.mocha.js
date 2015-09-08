process.env.wipe = true; // fresh db

var _ = require('lodash');
var expect = require('expect.js');
var request = require('supertest-as-promised');
var Sequelize = require('sequelize');
var app = require('../index');
var nconf = require('nconf');
var jobsController = require('../controllers/jobs');
var db;

var acct = email=> _.defaults({password:'xyz',confirmPassword:'xyz'},{email});
var oldReqs = _.reduce(['http','https'], (m,v)=>{m[v]=require(v).request;return m}, {});
var revertSepia = ()=>
  ['http','https'].forEach(protocol=> require(protocol).request=oldReqs[protocol]);

describe('Jobpig', function() {
  this.timeout(0);
  before(function(done){
    db = require('../models/models');
    db.syncPromise.then(()=>done());
  })

  //after(app.close)
  it('runs cron', function(done) {
    process.env.VCR_MODE = 'playback';
    var sepia = require('sepia');
    db.Meta.needsCron()
    .then(val=>{
      expect(val).to.be(true);
      return db.Meta.runCronIfNecessary();
    }).then(()=>db.Job.count())
    .then(ct=>{
      expect(ct).to.be.greaterThan(0);
      revertSepia();
      done();
    })
  })

  it('can register', function(done){
    var agent = request(app),
      jwt;
    agent.post('/register').send(acct('x@x.com')).expect(200)
    .then(res=>{
        jwt = res.body.token;
        return agent.get('/jobs').set('x-access-token', jwt).expect(200);
      })
    .then(res=>{
      expect(_.size(res.body)).to.be.greaterThan(0);
      done();
    }).catch(done);
  })

  it('lists my job postings', function(done){
    var users, jobPost, jwt;

    // register 2 users, 1 employer
    var agent = request(app);
    Promise.all([
      agent.post('/register').send(acct('good@x.com')).expect(200).then(res=>{
        jwt = res.body.token;
        return Promise.resolve();
      }),
      agent.post('/register').send(acct('bad@x.com')).expect(200),
      agent.post('/register').send(acct('employer@y.com')).expect(200)
    ])
    .then(()=>db.User.findAll())
    .then(_users=>{
      //store users in closure {good:[Object], bad:[Object], employer:[Object]}
      users = _.reduce(['good','bad','employer'],(m,v,k)=>{
        m[v] = _.find(_users, {email:v+'@x.com'});
        return m;
      },{});

      // Create custom job post
      return agent.post('/jobs')
        .set('x-access-token', jwt)
        .send({title: 'x', description: 'x', tags: 'a,b,c,d,e,f,g'})
        .expect(200);
    })
    .then(()=>db.Job.findOne({where:{title:'x'}, include:[db.Tag]}))

    // users upvote / downvote the posting
    .then(_job=> {
      jobPost = _job;
      return Promise.all(
        jobPost.tags.map(t=> users.bad.addTag(t, {score:-10}) ).concat(
          jobPost.tags.map(t=>users.good.addTag(t, {score:+10}) )
        )
      )
    })

    // Get the employer's results
    .then(()=>agent.get('/jobs/mine').set('x-access-token', jwt).expect(200))
    .then(res=>{
      var jobs = res.body;
      expect(jobs[0].users.length).to.be(1);
      expect(jobs[0].users[0].id).to.be(users.good.id);
      expect(jobs[0].users[0].score).to.be(70);
      done();
    }).catch(done);
  })
})
