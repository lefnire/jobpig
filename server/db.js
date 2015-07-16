'use strict';

var Sequelize = require('sequelize'),
  nconf = require('nconf'),
  _ = require('lodash'),
  Promise = require('sequelize/node_modules/bluebird');

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
},
{
  classMethods: {
    filterByUser(UserId) {
      return sequelize.query(`
SELECT "Jobs".*,
COALESCE((SELECT "UserJobs".status FROM "UserJobs" WHERE "UserJobs"."JobId"="Jobs".id AND "UserJobs"."UserId"=:UserId),'inbox') "status",
to_json(array_agg("Tags")) "Tags"
FROM "Jobs"
LEFT JOIN ("JobTag" INNER JOIN "Tags" ON "Tags"."id" = "JobTag"."TagId") ON "Jobs"."id" = "JobTag"."JobId"
WHERE NOT EXISTS (
  SELECT "UserTags"."score" FROM "UserTags" WHERE "UserTags"."TagId"="JobTag"."TagId" AND "UserTags"."UserId"=:UserId AND "UserTags"."score"<0
) OR EXISTS (
  SELECT "UserTags"."score" FROM "UserTags" WHERE "UserTags"."TagId"="JobTag"."TagId" AND "UserTags"."UserId"=:UserId AND "UserTags"."score">0
)
GROUP BY "Jobs"."id"
      `, { replacements: {UserId}, type: sequelize.QueryTypes.SELECT });
      //return this.findAll({ //sequelize.connectionManager.lib.Query
      //  attributes: _.keys(this.attributes).concat([
      //    [sequelize.literal(`COALESCE("Users.UserJob"."status",'inbox')`), 'status']
      //  ]),
      //  include: [Tag, User]
      //})
    },
    bulkCreateWithTags(jobs){
      //FIXME upsert
      //FIXME look into bulk-create (can do with associations?)
      //FIXME return promise (see require("bluebird"))
      //var tags = _(_.pluck(jobs, 'tags')).flatten().unique().value();
      jobs.forEach((job)=> {
        Job.findOrCreate({where:{key:job.key}, defaults:job}).spread((_job) => {
          job.tags.forEach((tag)=> {
            Tag.findOrCreate({where:{key:tag}, defaults:{key: tag, text: tag}}).spread((_tag)=>{
              _job.addTag(_tag);
            })
          })
        })
      })
    }
  },
  indexes: [
    {unique: true, fields: ['key']}
  ]
});

var Tag = sequelize.define('Tag', {
  key: Sequelize.STRING,
  text: Sequelize.STRING
}, {
  indexes: [
    {unique:true, fields:['key']}
  ]
});

var UserJob = sequelize.define('UserJob', {
  status: {type:Sequelize.ENUM('inbox','hidden','saved','applied'), defaultValue:'inbox'}
});

var UserTag = sequelize.define('UserTag', {
  score: Sequelize.INTEGER
}, {
  classMethods: {
    score(UserId, dir, attrs){
      _.each(attrs, (v,k)=>{
        if (!~k.indexOf('Tag')) return; // handle company, industry, etc later
        UserTag.upsert({UserId, TagId:k.split('.')[1], score:dir} ) //fixme $inc score, not set
      });
      //fixme return promise
    }
  }
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