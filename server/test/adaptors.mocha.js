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
    db.Cron.create({last_run:new Date()})
    .then(()=>db.Cron.isOutdated())
    .then(val=>{
      expect(val).to.be(false);
      return global.sequelize.query(`UPDATE cron SET last_run = CURRENT_TIMESTAMP - INTERVAL '1 day'`);
    }).then(()=>db.Cron.isOutdated())
    .then(val=>{
      expect(val).to.be(true);
      return db.Cron.refreshIfOutdated();
    }).then(()=>{
      done();
    })
  })
})