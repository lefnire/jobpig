'use strict';
const Sequelize = require('sequelize');
const nconf = require('nconf');
const _ = require('lodash');
const db = nconf.get(nconf.get("NODE_ENV"));

global.sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  dialect: db.dialect,
  logging: false,
  define:{
    underscored: true,
    freezeTableName:true
  }
});

const Job = require('./job');
const Message = require('./message');
const Meta = require('./meta');
const Payment = require('./payment');
const Tag = require('./tag');
const User = require('./user');
const UserJob = require('./user_job');
const UserTag = require('./user_tag')
const Coupon = require('./coupon');

// Jobs have tags
Tag.belongsToMany(Job, {through: 'job_tags'});
Job.belongsToMany(Tag, {through: 'job_tags'});

// User sets job status [match|applied|liked|disliked]
User.belongsToMany(Job, {through: UserJob});
Job.belongsToMany(User, {through: UserJob});

// User scores tags
User.belongsToMany(Tag, {through: UserTag});
Tag.belongsToMany(User, {through: UserTag});

// Employers create jobs
User.hasMany(Job);
Job.belongsTo(User);

// Post sponsored job
User.hasMany(Payment);
Payment.belongsTo(User);

// Users send messages to each other
User.hasMany(Message); // sent (Message.to for received)
Message.belongsTo(User); // sent
Message.hasMany(Message, { onDelete: 'cascade' })
Message.belongsTo(Message); // Response thread

// If new setup, init db. Export the function for tests, invoke immediately for dev/production
let initDb = wipe => sequelize.sync(wipe ? {force:true} : null)
  .then(() => Meta.count({$where:{key:'cron'}}))
  .then(ct => {
    return ct ? Promise.resolve()
    : sequelize.query(`insert into meta (key,val,created_at,updated_at) values ('cron',now()-interval '1 day', now(), now())`,
      {type:sequelize.QueryTypes.UPDATE})
  });
if (nconf.get('NODE_ENV') !== 'test')
  initDb(nconf.get('wipe'));

module.exports = {
  User,
  Job,
  Tag,
  UserJob,
  UserTag,
  Message,
  Meta,
  Payment,
  Coupon,
  initDb
};