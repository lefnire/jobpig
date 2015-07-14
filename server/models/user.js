// Require all the stuff
var Sequelize = require('sequelize'),
  db = require('./db');

//var passportLocalSequelize = require('passport-local-sequelize');
//var User = passportLocalSequelize.defineUser(db, {
//  favoriteColor: Sequelize.STRING
//});

var User = db.define('User', {
  linkedin: Sequelize.STRING
});


db.sync();// fixme?

module.exports = User;