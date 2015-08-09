var _ = require('lodash');
var expect = require('expect.js');
var request = require('supertest-as-promised');
var Sequelize = require('sequelize');
var app = require('../index');
var jobsController = require('../controllers/jobs');
var nconf = require('nconf');
var sepia = require('sepia');
var db;

describe('JobSeed', function() {
  this.timeout(0);
  before(function(done){
    db = require('../models/models');
    sequelize.sync({force:true}).then(()=>{
      // Seed Cron
      return sequelize.query(`insert into meta (key,val,created_at,updated_at) values ('cron',current_timestamp,current_timestamp,current_timestamp)`,
        {type:sequelize.QueryTypes.UPDATE})
    }).then(()=>done());
  })
  //after(app.close)
  it('runs cron', function(done) {
    //process.env.VRC_MODE = 'playback'; fixme not working
    db.Meta.needsCron()
    .then(val=>{
      expect(val).to.be(false);
      return sequelize.query(`UPDATE meta SET val=CURRENT_TIMESTAMP - INTERVAL '1 day'`);
    }).then(()=>db.Meta.needsCron())
    .then(val=>{
      expect(val).to.be(true);
      return db.Meta.runCronIfNecessary();
    }).then(()=>db.Job.count())
    .then(ct=>{
      expect(ct).to.be.greaterThan(0);
      done();
      //delete process.env.VCR_MODE;
    })
  })

  it.skip('can register', function(done){
    var agent = request(app);
    agent.post('/register').send({email:'x@y.com',password:'password'}).expect(302)
    .then(res=>agent.post('/login').send({email: 'x@y.com', password: 'password'}).expect(302))
    .then(res=>agent.get('/jobs').expect(200))
    .then(res=>{
      expect(_.size(res.body)).to.be.greaterThan(0);
      done();
    }).catch(done);
  })

  it.only('lists my job postings', function(done){
    var users, jobPost;

    // register 2 users, 1 employer
    var agent = request(app);
    agent.post('/register').send({email:'good@x.com', password:'x'}).expect(302)
    .then(()=>agent.post('/register').send({email:'bad@x.com', password:'x'}).expect(302))
    .then(()=>agent.post('/register').send({email:'employer@x.com',password:'x'}).expect(302))
    .then(()=>db.User.findAll())
    .then((_users)=>{
      //store users in closure {good:[Object], bad:[Object], employer:[Object]}
      users = _.reduce(['good','bad','employer'],(m,v,k)=>{
        m[v] = _.find(_users, {email:`${v}@x.com`});
        return m;
      },{});

    // Create custom job post
      return new Promise((resolve,reject)=>{
        var req = {
          user: users.employer,
          body: {title: 'x', description: 'x', tags: 'a,b,c,d,e,f,g'}
        };
        var res = {sendStatus:()=>resolve()}
        jobsController.create(req, res);
      })
    })
    .then(()=>db.Job.findOne({where:{title:'x'}, include:[db.Tag]}))


    // users upvote / downvote the posting
    .then((_job)=> {
      jobPost = _job;
      return Promise.all(
        jobPost.tags.map( t=>users.bad.addTag(t, {score:-1}) ).concat(
          jobPost.tags.map( t=>users.good.addTag(t, {score:+1}) )
        )
      )
    })

    // Get the employer's results
    .then(()=>{
      return new Promise((resolve,reject)=>{
        var req = {user:users.employer};
        var res = {json:(jobs)=>resolve(jobs)};
        jobsController.mine(req, res);
      })
    })
    .then(jobs=>{
      expect(jobs[0].users.length).to.be(1);
      expect(jobs[0].users[0].id).to.be(users.good.id);
      expect(jobs[0].users[0].score).to.be(7);
      done();
    })
  })
})
