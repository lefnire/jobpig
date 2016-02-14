'use strict';

//FIXME separate to multiple files

const Sequelize = require('sequelize'),
  nconf = require('nconf'),
  _ = require('lodash'),
  db = nconf.get(nconf.get("NODE_ENV")),
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

let defaultUserSchema = passportLocalSequelize.defaultUserSchema;
delete defaultUserSchema.username;
let User = sequelize.define('users', _.defaults({
  email: {type:Sequelize.STRING, validate:{ isEmail:true }, unique:true, allowNull:false},
  hash: {type: Sequelize.TEXT, allowNull: false}, //FIXME overriding passportLocalSequelize because hash=STRING (aka varchar 255) but the generated hash is huge
  remote_only: {type:Sequelize.BOOLEAN, defaultValue:false},
  linkedin_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  twitter_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  stackoverflow_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  github_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  fullname: Sequelize.STRING,
  pic: {type:Sequelize.STRING, validate:{isUrl:true}},
  bio: Sequelize.TEXT,
  company: Sequelize.STRING
}, defaultUserSchema));
passportLocalSequelize.attachToUser(User, {
  usernameField: 'email',
  usernameLowerCase: true,
});

let Job = sequelize.define('jobs', {
  money: Sequelize.STRING, // Number? (dealing with hourly-rate, gig budget, salary)
  company: Sequelize.STRING,
  description: Sequelize.TEXT,
  key: {type:Sequelize.STRING, allowNull:false, unique:true},
  location: Sequelize.STRING,
  source: {type:Sequelize.STRING, allowNull:false},
  title: {type:Sequelize.STRING, allowNull:false},
  url: {type:Sequelize.STRING, allowNull:false},
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
LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.user_id=:user_id
LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id
LEFT JOIN user_companies uc ON uc.user_id=:user_id AND uc.title=j.company

${user.remote_only ? "WHERE j.remote=true" : ""}

GROUP BY j.id, uj.note, uj.status, uc.score

HAVING COALESCE(uj.status,'inbox')=:status AND COALESCE(SUM(ut.score),0)+COALESCE(uc.score,0)>-75

ORDER BY score DESC, j.created_at DESC

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

    // Sequelize doesn't support bulkCreateWithAssociations, nor does it support bulkCreate while ignoring constraint
    // errors (duplicates) for Postgres. So we're doing some custom joojoo here
    bulkCreateWithTags(jobs) {
      // clean up job tags (Angular JS, AngularJS => 'angularjs')
      jobs.forEach(job => {
        job.tags = _.map(job.tags, tag => tag.toLowerCase().replace(/\s/g, ''));
      });

      // full list of (unique) tags
      let tags = _(jobs).map('tags').flatten().uniq().map(key => {return {key}}).value();

      // Find existing jobs & tags so we don't have a validation error
      let attributes = ['id', 'key'];
      return Promise.all([
        Job.findAll({where: {key: {$in: _.map(jobs, 'key')}}, attributes}),
        Tag.findAll({where: {key: {$in: _.map(tags, 'key')}}, attributes})
      ]).then(vals => {
        // Replace tag "shells" w/ the full models if available
        tags = tags.map(t => _.find(vals[1], {key: t.key}) || t);

        // Then create any that don't already exist
        return Promise.all([
          Job.bulkCreate(_.filter(jobs, j => !_.find(vals[0], {key: j.key})), {returning: true}),
          Tag.bulkCreate(_.reject(tags, 'id'), {returning: true}),
        ]);
      }).then(vals => {
        let newJobs = vals[0],
          joins = [];
        tags = tags.map(t => _.find(vals[1], {key: t.key}) || t);

        newJobs.forEach(j => {
          joins = joins.concat(_.find(jobs, {key: j.key}).tags.map(key => {
            return {
              job_id: j.id,
              tag_id: _.find(tags, {key}).id
            };
          }));
        })
        return sequelize.model('job_tags').bulkCreate(joins);
      });
    },

    addCustom(user, job){
      _.defaults(job, {
        key: job.url || uuid.v4(), // todo do we really need job.key for anything?
        source: 'jobpig',
        url: 'http://127.0.0.1:3000',
        user_id: user.id
      });
      job.tags = job.tags.split(',').map(t=>t.trim());
      return this.bulkCreateWithTags([job]);
    },
    score(user_id, job_id, status){

      // First set its status
      let setStatus = UserJob.upsert({user_id,job_id,status});

      // Then score attributes, unless setting to 'inbox' or 'hidden'
      // hidden means "hide this post, but don't hurt it" (maybe repeats of something you've already applied to)
      let score = ~['inbox','hidden'].indexOf(status) ? 0 : status=='disliked' ? -1 : +1;
      if (!score)
        return setStatus;

      return Promise.all([
        // Status
        setStatus,

        // Company
        this.findOne({where:{id:job_id}, attributes:['company']}).then(job=>
          UserCompany.upsert({title:job.company,user_id}).then(()=>
            sequelize.query(`UPDATE user_companies SET score=score+:score WHERE title=:title AND user_id=:user_id AND locked<>TRUE`,
              {replacements: {user_id, title:job.company, score}})
          )
        ),

        // Tags
        sequelize.query(`
          -- Bulk create any missing user_tags
          INSERT INTO user_tags (user_id, tag_id, score, locked, created_at, updated_at)
          SELECT :user_id, t.tag_id, 0, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          FROM (SELECT tag_id FROM job_tags WHERE job_id=:job_id EXCEPT SELECT tag_id FROM user_tags WHERE user_id=:user_id) t;
          -- Then increment their score
          UPDATE user_tags SET score=score+:score
          WHERE tag_id IN (SELECT tag_id FROM job_tags WHERE job_id=:job_id) AND user_id=:user_id AND locked<>true
        `, {replacements: {user_id, job_id, score}})
      ]);
    }
  },
  indexes: [
    {unique: true, fields: ['key']}
  ]
});

let Tag = sequelize.define('tags', {
  key: {type:Sequelize.STRING, allowNull:false, unique:true},
  //text: Sequelize.STRING
}, {
  indexes: [
    {unique:true, fields:['key']}
  ]
});

let UserJob = sequelize.define('user_jobs', {
  status: {type:Sequelize.ENUM('inbox','disliked','liked','applied','hidden'), defaultValue:'inbox', allowNull:false},
  note: Sequelize.TEXT
});

let UserCompany = sequelize.define('user_companies', {
  title: Sequelize.TEXT,
  score: {type:Sequelize.INTEGER, defaultValue:0, allowNull:false},
  locked: {type:Sequelize.BOOLEAN, defaultValue:false}
}, {
  indexes: [
    {unique:true, fields:['title','user_id']}
  ]
});

let UserTag = sequelize.define('user_tags', {
  score: {type:Sequelize.INTEGER, defaultValue:0, allowNull:false},
  locked: {type:Sequelize.BOOLEAN, defaultValue:false},
});

let Message = sequelize.define('messages', {
  to: {
    type: Sequelize.INTEGER,
    references: {model: User, key: 'id'}
  },
  subject: Sequelize.STRING,
  body: {type: Sequelize.TEXT, allowNull: false},
});


let Meta = sequelize.define('meta', {
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
      return this.needsCron().then(val => {
        if (!val)
          return Promise.resolve();
        console.log('Refreshing jobs....');
        // Update cron, delete stale jobs
        return sequelize.query(`
          UPDATE meta SET val=CURRENT_TIMESTAMP WHERE key='cron';
          DELETE from jobs where created_at < CURRENT_TIMESTAMP - INTERVAL '10 days';
        `).then(()=>require('../lib/adaptors').refresh()); //FIXME require here, circular reference models.js/adaptors.js
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
Job.belongsTo(User);

User.hasMany(Message); // sent
Message.belongsTo(User); // sent
Message.belongsTo(Message); // Response thread
Message.hasOne(Message)
// Message.to for received

// If new setup, init db.
let syncPromise = sequelize.sync(nconf.get('wipe') ? {force:true} : null)
  .then(()=> Meta.count({$where:{key:'cron'}}))
  .then(ct=>{
    return (ct) ? Promise.resolve() :
    sequelize.query(`insert into meta (key,val,created_at,updated_at) values ('cron',now()-interval '1 day', now(), now())`,
      {type:sequelize.QueryTypes.UPDATE})
  })

module.exports = {
  User,
  Job,
  Tag,
  UserJob,
  UserTag,
  UserCompany,
  Message,
  Meta,
  syncPromise
};