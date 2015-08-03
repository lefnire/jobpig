'use strict';

//FIXME separate to multiple files

var Sequelize = require('sequelize'),
  nconf = require('nconf'),
  _ = require('lodash'),
  db = nconf.get('development');

var sequelize = new Sequelize(db.database, db.username, db.development, {
  host: db.host,
  dialect: db.dialect,
  //logging: false,
  define:{
    underscored: true,
    freezeTableName:true
  }
});
global.sequelize = sequelize;

var User = sequelize.define('users', {
  linkedin: {type:Sequelize.STRING, unique:true},
});

var Job = sequelize.define('jobs', {
  money: Sequelize.STRING, // Number? (dealing with hourly-rate, gig budget, salary)
  company: Sequelize.STRING,
  description: Sequelize.TEXT,
  key: {type:Sequelize.STRING, allowNull:false, unique:true},
  location: Sequelize.STRING,
  source: {type:Sequelize.STRING, allowNull:false},
  title: {type:Sequelize.STRING, allowNull:false},
  url: {type:Sequelize.STRING, allowNull:false, unique:true},
  remote: Sequelize.BOOLEAN
},
{
  classMethods: {
    filterJobs(user_id, status) {
      status = status || 'inbox';
      return sequelize.query(`
SELECT
j.*
,COALESCE(uj.status,'inbox') status
,uj.note
,to_json(array_agg(tags)) tags
,COALESCE(SUM(ut.score),0) score

FROM jobs j

LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.locked IS NOT TRUE
LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id

GROUP BY j.id, uj.note, uj.status

HAVING COALESCE(uj.status,'inbox') = :status AND COALESCE(SUM(ut.score),0)>-75

ORDER BY score DESC, j.id

LIMIT :limit;
`, { replacements: {user_id, status, limit:status=='inbox' ? 1 : 50}, type: sequelize.QueryTypes.SELECT });
    },
    bulkCreateWithTags(jobs){
      return new Promise(resolve=>{
        // clean up job tags
        _.each(jobs, job=>{
          job.tags = _.map(job.tags, tag=>{
            var key = tag.toLowerCase().replace(/\s/g, ''); // Angular JS, AngularJS => 'angularjs'
            if (key!='js') key = key.replace(/\.?js$/g, ''); // nodejs, node js, node.js, node => 'node'
            return key;
          })
        })

        // full list of (unique) tags
        var tags = _(_.pluck(jobs,'tags')).flatten().unique().value();

        // Create jobs (ignore duplicates, unhandled exceptions)
        var _jobs;

        // Ok, here we begin some bad magic. Sequelize doesn't support bulkCreateWithAssociations, nor does it support bulkCreate
        // while ignoring constraint errors (duplicates) for Postgres. So here I'm running bulkCreate, followed by finally() in
        // case of dupes (which we ignore). I'm lucky that bulkCreate doesn't return anything, since finally() is argument-less.
        // This bad magic is luck, so find a better way!
        Job.bulkCreate(jobs).finally(()=> { // will error on dupes
          return Job.findAll({where: {key: {$in: _.pluck(jobs, 'key')}}, attributes: ['id', 'key']}).then(__jobs=> {
            _jobs = __jobs;
            return Tag.bulkCreate(_.map(tags, function (t) {return {key: t}}));
          }).finally(()=> {
            return Tag.findAll({where: {key: {$in: tags}}, attributes: ['id', 'key']}).then(_tags=> {
              var joins = [];
              _.each(jobs, j=> {
                _.each(j.tags, t=> {
                  try {
                    let join = {
                      job_id: _.find(_jobs, {key: j.key}).id,
                      tag_id: _.find(_tags, {key: t}).id //fixme,  Cannot read property 'id' of undefined
                    }
                    joins.push(join);
                  }catch(e){}
                })
              })
              sequelize.model('job_tags').bulkCreate(joins).finally(resolve);
            });
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
    score(user_id, job_id, status){
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

        // then score attributes, unless setting to 'inbox' or 'hidden'
        // hidden means "hide this post, but don't hurt it" (maybe repeats of something you've already applied to)
        var dir = (_.includes(['inbox','hidden'], status)) ? 0 : status=='disliked' ? -1 : +1;
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
  key: {type:Sequelize.STRING, allowNull:false, unique:true},
  //text: Sequelize.STRING
}, {
  indexes: [
    {unique:true, fields:['key']}
  ]
});

var UserJob = sequelize.define('user_jobs', {
  status: {type:Sequelize.ENUM('inbox','disliked','liked','applied','hidden'), defaultValue:'inbox', allowNull:false},
  note: Sequelize.TEXT
});

var UserCompany = sequelize.define('user_companies', {
  title: Sequelize.TEXT,
  score: {type:Sequelize.INTEGER, defaultValue:0, allowNull:false}
});

var UserTag = sequelize.define('user_tags', {
  score: {type:Sequelize.INTEGER, defaultValue:0, allowNull:false},
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

var Meta = sequelize.define('meta', {
  key: {type:Sequelize.STRING, primaryKey:true},
  val: Sequelize.STRING
}, {
  classMethods:{
    needsCron(){
      return sequelize.query(`SELECT EXTRACT(DOY FROM meta.val::TIMESTAMP WITH TIME ZONE)!=EXTRACT(DOY FROM CURRENT_TIMESTAMP) val FROM meta WHERE key='cron'`,
        {type:sequelize.QueryTypes.SELECT}).then( res=> {
          return Promise.resolve((res[0].val));
        } );
    },
    runCronIfNecessary(){
      return this.needsCron().then(val=>{
        if (!val) return Promise.resolve();
        console.log('Refreshing jobs....');
        // Update cron, delete stale jobs
        return sequelize.query(`UPDATE meta SET val=CURRENT_TIMESTAMP WHERE key='cron'; DELETE from jobs where created_at < CURRENT_TIMESTAMP - INTERVAL '1 month';`)
          .then(()=>require('../lib/adaptors').refresh()); //FIXME require here, circular reference models.js/adaptors.js
      });
    }
  }
})


Tag.belongsToMany(Job, {through: 'job_tags'});
Job.belongsToMany(Tag, {through: 'job_tags'});

User.belongsToMany(Job, {through: UserJob});
Job.belongsToMany(User, {through: UserJob});

User.belongsToMany(Tag, {through: UserTag});
Tag.belongsToMany(User, {through: UserTag});

User.hasMany(UserCompany);

//sequelize.sync({force:true});
//sequelize.sync();

module.exports = {User,Job,Tag,UserJob,UserTag,Meta};