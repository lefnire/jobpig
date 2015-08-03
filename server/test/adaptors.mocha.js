var _ = require('lodash');
var expect = require('expect.js');
require('sepia'); // mocked http requests (testing)
var request = require('request');
var db;
var Sequelize = require('sequelize');

describe('Adaptors', function() {
  var app = require('../index');
  before(function(done){
    app.listen(3000, ()=>{
      db = require('../models/models');
      global.sequelize.sync({force:true}).then(()=>done());
    });
  })
  //after(app.close)
  it('runs cron', function(done) {
    global.sequelize.query(`insert into meta (key,val,created_at,updated_at) values ('cron',current_timestamp,current_timestamp,current_timestamp)`)
    .then(()=>db.Meta.needsCron())
    .then(val=>{
      expect(val).to.be(false);
      return global.sequelize.query(`UPDATE meta SET val=CURRENT_TIMESTAMP - INTERVAL '1 day'`);
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
})