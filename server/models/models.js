'use strict';

//FIXME separate to multiple files

var Sequelize = require('sequelize'),
  nconf = require('nconf'),
  _ = require('lodash'),
  db = nconf.get('development'),
  uuid = require('node-uuid'),
  passportLocalSequelize = require('passport-local-sequelize');

global.sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  dialect: db.dialect,
  logging: false,
  define:{
    underscored: true,
    freezeTableName:true
  }
});

var defaultUserSchema = passportLocalSequelize.defaultUserSchema;
delete defaultUserSchema.username;
var User = sequelize.define('users', _.defaults({
  email: {type:Sequelize.STRING, validate:{ isEmail:true }, unique:true, allowNull:false},
  hash: {type: Sequelize.TEXT, allowNull: false}, //FIXME overriding passportLocalSequelize because hash=STRING (aka varchar 255) but the generated hash is huge
  remote_only: {type:Sequelize.BOOLEAN, defaultValue:false},
  linkedin_id: {type:Sequelize.STRING, unique:true},
  linkedin_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  fullname: Sequelize.STRING,
  pic: {type:Sequelize.STRING, validate:{isUrl:true}},
  bio: Sequelize.TEXT,
}, defaultUserSchema));
passportLocalSequelize.attachToUser(User, {
  usernameField: 'email',
  usernameLowerCase: true,
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
}, {
  classMethods: {
    filterJobs(user, status) {
      status = status || 'inbox';
      return sequelize.query(`
SELECT
j.*
,COALESCE(uj.status,'inbox') status
,uj.note
,to_json(array_agg(tags)) tags
,COALESCE(SUM(ut.score),0)+COALESCE(uc.score,0) score

FROM jobs j

LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.user_id=:user_id AND (ut.locked IS NOT TRUE OR ut.score>0)
LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id
LEFT JOIN user_companies uc ON uc.user_id=:user_id AND uc.title=j.company AND (uc.locked<>true AND uc.score>0)

${user.remote_only ? "WHERE j.remote=true" : ""}

GROUP BY j.id, uj.note, uj.status, uc.score

HAVING COALESCE(uj.status,'inbox')=:status AND COALESCE(SUM(ut.score),0)+COALESCE(uc.score,0)>-75

ORDER BY score DESC, j.id

LIMIT :limit;
`, { replacements: {user_id:user.id, status, limit:status=='inbox' ? 1 : 50}, type: sequelize.QueryTypes.SELECT });
    },
    findMine(user){
      return sequelize.query(`
-- @see http://stackoverflow.com/a/27626358/362790
SELECT u.users, jt.tags, jobs.*
FROM jobs

LEFT JOIN (
  SELECT job_id, to_json(array_agg(tags)) tags
  FROM job_tags
  INNER JOIN tags ON tags.id=job_tags.tag_id
  GROUP BY 1
) jt ON jobs.id=jt.job_id

-- users whos sum > 10
LEFT JOIN LATERAL (
  SELECT to_json(array_agg(_)) users FROM (
    SELECT COALESCE(SUM(user_tags.score),0) score, users.*, tags
    FROM users
    INNER JOIN user_tags ON user_tags.user_id=users.id
    INNER JOIN job_tags ON job_tags.tag_id=user_tags.tag_id AND job_tags.job_id=jobs.id
    INNER JOIN tags ON user_tags.tag_id=tags.id
    GROUP BY users.id
    HAVING COALESCE(SUM(user_tags.score),0)>10
    ORDER BY score DESC
    -- TODO calculate other attributes
  ) _
) u ON TRUE

WHERE jobs.user_id=:user_id
ORDER BY jobs.id
`, {replacements:{user_id:user.id}, type:sequelize.QueryTypes.SELECT});
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
    addCustom(user, job){
      _.defaults(job, {
        key: job.url || uuid.v4(), // todo do we really need job.key for anything?
        source: 'jobseed',
        url: 'http://127.0.0.1:3000',
        user_id: user.id
      });
      job.tags = job.tags.split(',').map(t=>t.trim());
      return this.bulkCreateWithTags([job]);
    },
    score(user_id, job_id, status){
      //TODO this can likely be cleaned up into a few efficient raw queries
      return this.findOne({
        where:{id:job_id},
        include:[
          {model:Tag, include:[User]},
          User
        ]
      }).then(job=>{

        var promises = [];

        // First set its status
        var uj = job.users[0];
        if (uj) {
          uj.user_jobs.status= status;
          promises.push(uj.user_jobs.save());
        } else {
          promises.push(UserJob.create({user_id,job_id,status}));
        }

        // then score attributes, unless setting to 'inbox' or 'hidden'
        // hidden means "hide this post, but don't hurt it" (maybe repeats of something you've already applied to)
        var dir = (_.includes(['inbox','hidden'], status)) ? 0 : status=='disliked' ? -1 : +1;
        if (!dir) return;

        promises.push(
        UserCompany.findOrCreate({where:{title:job.company,user_id}, defaults:{title:job.company,user_id}}).then(_userCompany=>{
          return sequelize.query(`update user_companies set score=score+:score where title=:title and user_id=:user_id`,
            { replacements: {user_id, title:job.company, score:dir}, type: sequelize.QueryTypes.UPDATE });
          //fixme: `_userCompany.save is not a function` wtf??
          //_userCompany.score += dir;
          //_userCompany.save();
        })
        )

        _.each(job.tags, tag=>{
          var user_tag = tag.users[0] && tag.users[0].user_tags;
          if (user_tag) {
            user_tag.score += dir;
            promises.push(user_tag.save());
          }
          else {
            promises.push(UserTag.create({user_id, tag_id:tag.id, score:dir}));
          }
        })

        return Promise.all(promises);
      })
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
  title: {type:Sequelize.TEXT, unique:true},
  score: {type:Sequelize.INTEGER, defaultValue:0, allowNull:false},
  locked: {type:Sequelize.BOOLEAN, defaultValue:false}
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

// For employers creating jobs
User.hasMany(Job);
Job.belongsTo(User)

// If new setup, init db.
var syncPromise = sequelize.sync(nconf.get('wipe') ? {force:true} : null)
  .then(()=> Meta.count({$where:{key:'cron'}}))
  .then(ct=>{
    return (ct) ? Promise.resolve() :
    sequelize.query(`insert into meta (key,val,created_at,updated_at) values ('cron',now()-interval '1 day', now(), now())`,
      {type:sequelize.QueryTypes.UPDATE})
  })

module.exports = {User,Job,Tag,UserJob,UserTag,UserCompany,Meta, syncPromise};