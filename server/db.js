'use strict';

var Sequelize = require('sequelize'),
  nconf = require('nconf'),
  _ = require('lodash'),
  Promise = require('sequelize/node_modules/bluebird');

var sequelize = new Sequelize(nconf.get('db:database'), nconf.get('db:username'), nconf.get('db:password'), {
  host: 'localhost',
  dialect: 'postgres',
  define:{
    underscored: true,
    freezeTableName:true
  }
});
global.sequelize = sequelize;

var User = sequelize.define('users', {
  linkedin: Sequelize.STRING
});

var Job = sequelize.define('jobs', {
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
    filterByUser(user_id) {
      return sequelize.query(`
SELECT jobs.*,
COALESCE((SELECT user_jobs.status FROM user_jobs WHERE user_jobs.job_id=jobs.id AND user_jobs.user_id=:user_id),'inbox') "status",
to_json(array_agg(tags)) tags
FROM jobs
LEFT JOIN (job_tags INNER JOIN tags ON tags.id=job_tags.tag_id) ON jobs.id=job_tags.job_id
WHERE NOT EXISTS (
  SELECT user_tags.score FROM user_tags WHERE user_tags.tag_id=job_tags.tag_id AND user_tags.user_id=:user_id AND user_tags.score<0
) OR EXISTS (
  SELECT user_tags.score FROM user_tags WHERE user_tags.tag_id=job_tags.tag_id AND user_tags.user_id=:user_id AND user_tags.score>0
)
GROUP BY jobs.id
LIMIT 50
      `, { replacements: {user_id}, type: sequelize.QueryTypes.SELECT });
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

var Tag = sequelize.define('tags', {
  key: Sequelize.STRING,
  text: Sequelize.STRING
}, {
  indexes: [
    {unique:true, fields:['key']}
  ]
});

var UserJob = sequelize.define('user_jobs', {
  status: {type:Sequelize.ENUM('inbox','hidden','saved','applied'), defaultValue:'inbox'}
});

var UserTag = sequelize.define('user_tags', {
  score: Sequelize.INTEGER
}, {
  classMethods: {
    score(user_id, dir, attrs){
      _.each(attrs, (v,k)=>{
        if (!~k.indexOf('Tag')) return; // handle company, industry, etc later
        UserTag.upsert({user_id, tag_id:k.split('.')[1], score:dir} ) //fixme $inc score, not set
      });
      //fixme return promise
    }
  }
});

Tag.belongsToMany(Job, {through: 'job_tags'});
Job.belongsToMany(Tag, {through: 'job_tags'});

User.belongsToMany(Job, {through: UserJob});
Job.belongsToMany(User, {through: UserJob});

User.belongsToMany(Tag, {through: UserTag});
Tag.belongsToMany(User, {through: UserTag});

sequelize.sync({force:true});
//sequelize.sync();

module.exports = {User,Job,Tag,UserJob,UserTag};