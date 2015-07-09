var Sequelize = require('sequelize');
var nconf = require('nconf');

var sequelize = new Sequelize(nconf.get('db:database'), nconf.get('db:username'), nconf.get('db:password'), {
  host: 'localhost', dialect: 'postgres'
});

module.exports = sequelize;