'use strict';

//FIXME separate to multiple files

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
SELECT j.*,
  COALESCE(uj.status,'inbox') status,
  uj.note,
--  jt.t AS tags
  to_json(array_agg(tags)) as tags

FROM (
  -- SELECT jobs.* FROM jobs LEFT JOIN job_tags ON jobs.id=job_tags.job_id
  SELECT jobs.* FROM jobs

  EXCEPT ( -- exclude bad jobs
    SELECT jobs.* FROM jobs
    INNER JOIN job_tags ON job_tags.job_id=jobs.id
    INNER JOIN user_tags ON user_tags.tag_id=job_tags.tag_id AND user_tags.user_id=:user_id AND user_tags.score<0
  )
) j

LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
/*LEFT JOIN (
    SELECT job_id, tag_id, to_json(array_agg(tags)) t
    FROM job_tags
    INNER JOIN tags ON tags.id=job_tags.tag_id
    GROUP BY job_id,tag_id
) jt ON j.id=jt.job_id*/

LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id
/*LEFT JOIN (
  SELECT job_id, status
  FROM user_jobs
  WHERE user_id=:user_id
  GROUP BY job_id,user_id,status
) uj ON uj.job_id=j.id*/

-- really necessary to group by all fields? getting error otherwise
GROUP BY j.id, j.budget, company, description, j.key, location, source, title, url, j.created_at, j.updated_at, uj.note, status
HAVING uj.status <> 'hidden' OR uj.status IS NULL
ORDER BY j.id
LIMIT 50
      `, { replacements: {user_id}, type: sequelize.QueryTypes.SELECT });
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
    },
    addCustom(user_id, job){
      this.create(job).then((_job)=>{
        UserJob.create({user_id,job_id:_job.id,note:job.note,status:'applied'});
        //TODO add tags
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
  status: {type:Sequelize.ENUM('inbox','hidden','saved','applied'), defaultValue:'inbox'},
  note: Sequelize.TEXT
});

var UserTag = sequelize.define('user_tags', {
  score: Sequelize.INTEGER
}, {
  classMethods: {
    score(user_id, dir, attrs){
      _.each(attrs, (v,k)=>{
        if (!~k.indexOf('tag')) return; // handle company, industry, etc later
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

//sequelize.sync({force:true});
sequelize.sync();

module.exports = {User,Job,Tag,UserJob,UserTag};