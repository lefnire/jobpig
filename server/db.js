'use strict';

var Sequelize = require('sequelize');
var nconf = require('nconf');

var sequelize = new Sequelize(nconf.get('db:database'), nconf.get('db:username'), nconf.get('db:password'), {
  host: 'localhost', dialect: 'postgres'
});
global.sequelize = sequelize;

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
  title: Sequelize.STRING,
  url: Sequelize.STRING
});

var Tag = sequelize.define('Tag', {
  key: Sequelize.STRING,
  text: Sequelize.STRING
});

var UserJob = sequelize.define('UserJob', {
  status: {type:Sequelize.ENUM('inbox','hidden','saved','applied'), defaultValue:'inbox'}
});

var UserTag = sequelize.define('UserTag', {
  score: Sequelize.INTEGER
});

Tag.belongsToMany(Job, {through: 'JobTag'});
Job.belongsToMany(Tag, {through: 'JobTag'});

User.belongsToMany(Job, {through: UserJob});
Job.belongsToMany(User, {through: UserJob});

User.belongsToMany(Tag, {through: UserTag});
Tag.belongsToMany(User, {through: UserTag});

//sequelize.sync({force:true});
sequelize.sync();

module.exports = {User,Job,Tag,UserJob,UserTag};