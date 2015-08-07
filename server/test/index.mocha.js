var _ = require('lodash');
var expect = require('expect.js');
require('sepia'); // mocked http requests (testing)
var request = require('supertest-as-promised');
var db;
var Sequelize = require('sequelize');
var host = 'http://localhost:3000';
var app = require('../index');

describe('JobSeed', function() {
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
    db.Meta.needsCron()
    .then(val=>{
      expect(val).to.be(false);
      return sequelize.query(`UPDATE meta SET val=CURRENT_TIMESTAMP - INTERVAL '1 day'`);
    }).then(()=>db.Meta.needsCron())
    .then(val=>{
      expect(val).to.be(true);
      return db.Meta.runCronIfNecessary();
    }).then(()=>{
      return db.Job.count();
    }).then(ct=>{
      expect(ct).to.be.greaterThan(0);
      done();
    })
  })

  it('finds matches for my job post', function(done){
    request(app).get('/jobs').then(res=>{
      expect(_.size(res.body)).to.be.greaterThan(0);
      done();
    }).catch(done);
  })
})
