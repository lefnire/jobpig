'use strict';

//FIXME separate to multiple files

var Sequelize = require('sequelize'),
  nconf = require('nconf'),
  _ = require('lodash'),
  Promise = require('sequelize/node_modules/bluebird'),
  queries = require('./queries'),
  db = nconf.get('development');

var sequelize = new Sequelize(db.database, db.username, db.development, {
  host: db.host,
  dialect: db.dialect,
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
      return sequelize.query(queries.filterJobs, { replacements: {user_id}, type: sequelize.QueryTypes.SELECT });
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
    },
    score(user_id, job_id, status, force){
      //TODO this can likely be cleaned up into a few efficient raw queries
      this.findOne({
        where:{id:job_id},
        include:[
          {model:Tag, include:[User]},
          User
        ]
      }).then(job=>{

        // First set its status
        var uj = job.users[0];
        if (uj) {
          uj.user_jobs.status= status;
          uj.user_jobs.save();
        } else {
          UserJob.create({user_id,job_id,status});
        }

        // then score attributes, unless setting to 'inbox' or req.params.force
        // force means "hide this post, but don't hurt it" (maybe repeats of something you've already applied to)
        var dir = (status=='inbox' || force==true) ? 0 : status=='hidden' ? -1 : +1;
        if (!dir) return;

        UserCompany.findOrCreate({where:{title:job.company,user_id}, defaults:{title:job.company,user_id}}).then(_userCompany=>{
          sequelize.query(`update user_companies set score=score+:score where title=:title and user_id=:user_id`,
            { replacements: {user_id, title:job.company, score:dir}, type: sequelize.QueryTypes.UPDATE });
          //fixme: `_userCompany.save is not a function` wtf??
          //_userCompany.score += dir;
          //_userCompany.save();
        })

        _.each(job.tags, tag=>{
          var user_tag = tag.users[0] && tag.users[0].user_tags;
          if (user_tag) {
            user_tag.score += dir;
            user_tag.save();
          }
          else {
            UserTag.create({user_id, tag_id:tag.id, score:dir});
          }
        })
      })
      //fixme return promise
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

var UserCompany = sequelize.define('user_companies', {
  title: Sequelize.TEXT,
  score: {type:Sequelize.INTEGER, defaultValue:0}
});

var UserTag = sequelize.define('user_tags', {
  score: {type:Sequelize.INTEGER, defaultValue:0},
  locked: {type:Sequelize.BOOLEAN, defaultValue:false},
},
{
  classMethods: {
    lock(user_id, tag_id){
      return sequelize.query(`UPDATE user_tags SET locked = NOT locked WHERE user_id=:user_id AND tag_id=:tag_id`,
        { replacements: {user_id, tag_id:+tag_id}, type: sequelize.QueryTypes.UPDATE });
    }
  }
});


Tag.belongsToMany(Job, {through: 'job_tags'});
Job.belongsToMany(Tag, {through: 'job_tags'});

User.belongsToMany(Job, {through: UserJob});
Job.belongsToMany(User, {through: UserJob});

User.belongsToMany(Tag, {through: UserTag});
Tag.belongsToMany(User, {through: UserTag});

User.hasMany(UserCompany);

//sequelize.sync({force:true});
sequelize.sync();

module.exports = {User,Job,Tag,UserJob,UserTag};