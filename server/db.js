'use strict';

var Sequelize = require('sequelize');
var nconf = require('nconf');
var async = require('async');

var sequelize = new Sequelize(nconf.get('db:database'), nconf.get('db:username'), nconf.get('db:password'), {
  host: 'localhost', dialect: 'postgres'
});

var User = sequelize.define('User', {
  linkedin: Sequelize.STRING
});

var Job = sequelize.define('Job', {
  budget: Sequelize.STRING,
  company: Sequelize.STRING,
  description: Sequelize.TEXT,
  //id: Sequelize.STRING,
  key: Sequelize.STRING,
  location: Sequelize.STRING,
  source: Sequelize.STRING,
  status: {type:Sequelize.ENUM('inbox','hidden','saved','applied'), defaultValue:'inbox'},
  title: Sequelize.STRING,
  url: Sequelize.STRING
});

var Tag = sequelize.define('Tag', {
  key: Sequelize.STRING,
  text: Sequelize.STRING
});

Tag.belongsToMany(Job, {through: 'JobTag'});
Job.belongsToMany(Tag, {through: 'JobTag'});

sequelize.sync();

module.exports = {User,Job,Tag};