// Require all the stuff
var Sequelize = require('sequelize'),
  db = require('./db'),
  passportLocalSequelize = require('passport-local-sequelize');

var User = passportLocalSequelize.defineUser(db, {
  favoriteColor: Sequelize.STRING
});

db.sync();// fixme?

module.exports = User;