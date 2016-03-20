'use strict';

//FIXME separate to multiple files
const Sequelize = require('sequelize');
const nconf = require('nconf');
const _ = require('lodash');
const db = nconf.get(nconf.get("NODE_ENV"));
const uuid = require('node-uuid');
const passportLocalSequelize = require('passport-local-sequelize');
const TAG_TYPES = require('../lib/constants').TAG_TYPES;

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
  activationRequired: true
});

let Job = sequelize.define('jobs', {
  description: Sequelize.TEXT,
  key: {type:Sequelize.STRING, allowNull:false, unique:true},
  title: {type:Sequelize.STRING, allowNull:false},
  url: {type:Sequelize.STRING, allowNull:false},
  pending: {type: Sequelize.BOOLEAN, defaultValue: false}
}, {
  classMethods: {
    filterJobs(user, status) {
      status = status || 'inbox';
      return sequelize.query(`
        SELECT
        j.*
        ,COALESCE(uj.status,'inbox') status
        ,uj.note
        ,json_agg(tags) tags
        ,COALESCE(SUM(ut.score),0) score

        FROM jobs j

        LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
        LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.user_id=:user_id
        LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id

        WHERE j.pending <> TRUE
        GROUP BY j.id, uj.note, uj.status
        HAVING COALESCE(uj.status,'inbox') = :status AND COALESCE(SUM(ut.score),0)>-75
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
          SELECT job_id, json_agg(tags) tags
          FROM job_tags
          INNER JOIN tags ON tags.id=job_tags.tag_id
          GROUP BY 1
        ) jt ON jobs.id=jt.job_id

        -- users whos sum > 10
        LEFT JOIN LATERAL (
          SELECT json_agg(_) users FROM (
            SELECT COALESCE(SUM(user_tags.score),0) score, users.*, tags
            FROM users
            INNER JOIN user_tags ON user_tags.user_id=users.id
            INNER JOIN job_tags ON job_tags.tag_id=user_tags.tag_id AND job_tags.job_id=jobs.id
            INNER JOIN tags ON user_tags.tag_id=tags.id
            GROUP BY users.id
            HAVING COALESCE(SUM(user_tags.score),0)>10 AND users.id <> :user_id
            ORDER BY score DESC
            -- TODO calculate other attributes
          ) _
        ) u ON TRUE

        WHERE jobs.user_id=:user_id AND jobs.pending <> TRUE
        ORDER BY jobs.id
      `, {replacements:{user_id:user.id}, type:sequelize.QueryTypes.SELECT});
    },

    // Sequelize doesn't support bulkCreateWithAssociations, nor does it support bulkCreate while ignoring constraint
    // errors (duplicates) for Postgres. So we're doing some custom juju here
    bulkCreateWithTags(jobs) {
      let tags;

      // First, remove re-posts (next-day cron overlap / same job on separate boards)
      return Job.findAll({where: {key: {$in: _.map(jobs, 'key')}}, attributes: ['key']})
      .then(existing => {
        jobs = _.reject(jobs, j => _.find(existing, {key: j.key}));

        // normalize tags
        jobs.forEach(job => {
          job.tags = _(job.tags)
            .map(text => ({text, key: text, type: TAG_TYPES.TAG})) // turn into tag objects
            .concat([ // add other job meta
              {key: job.company, text: job.company, type: TAG_TYPES.COMPANY},
              {key: job.location, text: job.location, type: TAG_TYPES.LOCATION},
              {key: job.source, text: job.source, type: TAG_TYPES.SOURCE},
              {key: job.remote ? 'remote' : null, text: 'Remote', type: TAG_TYPES.TAG} // tag so they can use in seeding
            ])
            .filter('key') // remove empty vals
            .map(feature => { // normalize tag keys, for uniqueness
              feature.key = feature.key
                .trim().toLowerCase() // sanitize
                .replace(/[_\. ](?=js)/g, '') // node.js, node_js, node js => nodejs
                .replace(/\.(?!net)/g, '') // replace all periods, except .net, asp.net, etc
                .replace(/(\s+|\-)/g, '_') // space/- => _
                .replace(/[^a-zA-Z0-9#\+\._]/g, '') // remove punctuation, except language chars (c++, c#, TODO what else?)
              //.replace(/_+/g,'_') // for any consecutive _s (eg "NY, NY" = NY__NY): squash to one _
              return feature;
            }).value();
        });

        // full list of (unique) tags
        tags = _(jobs).map('tags').flatten().uniqBy(f => `${f.key}--${f.type}`).value();

        return Tag.findAll({where: {key: {$in: _.map(tags, 'key')}}, attributes: ['id', 'key', 'type']});
      }).then(existing => {

        // hydrate plain objects w/ their models if available
        tags = tags.map(t => _.find(existing, {key: t.key, type: t.type}) || t);

        // Only create tags that don't already exist
        return Promise.all([
          Job.bulkCreate(jobs, {returning: true}),
          Tag.bulkCreate(_.reject(tags, 'id'), {returning: true}),
        ]);
      }).then(vals => {
        // And hydrate the rest
        tags = tags.map(t => _.find(vals[1], {key: t.key, type: t.type}) || t);

        let joins = _.reduce(vals[0], (joins, j) => {
          return joins.concat(_.find(jobs, {key: j.key}).tags.map(t => ({
            job_id: j.id,
            tag_id: _.find(tags, {key: t.key, type: t.type}).id
          })));
        }, []);
        joins = _.uniqBy(joins, j => j.job_id+'-'+j.tag_id); // remove duplicates FIXME this shouldn't be happening
        return sequelize.model('job_tags').bulkCreate(joins);
      });
    },

    addCustom(user_id, job){
      // we can set key & url defaults, but not in the field options because they need access to eachother
      if (_.isString(job.tags))
        job.tags = job.tags.split(',').map(_.trim);
      let key = uuid.v4();
      job = _(job).omitBy(_.isEmpty)
        .defaults({
          key,
          user_id,
          source: 'jobpig',
          url: 'http://jobpigapp.com/jobs/' + key,
          pending: true // Important - this is set to true after they've paid
        }).value();
      return this.bulkCreateWithTags([job])
        .then(() => Job.findOne({where:{key}}));
    },

    score(user_id, job_id, status){
      // First set its status
      let setStatus = UserJob.upsert({user_id,job_id,status});

      // Then score attributes, unless setting to 'inbox' or 'hidden'
      // hidden means "hide this post, but don't hurt it" (maybe repeats of something you've already applied to)
      let score = ~['inbox','hidden'].indexOf(status) ? 0 : status === 'disliked' ? -1 : +1;
      if (!score)
        return setStatus;

      return Promise.all([
        // Status
        setStatus,

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
  key: {type: Sequelize.STRING, allowNull: false},
  text: Sequelize.STRING,
  type: {type: Sequelize.INTEGER /*ENUM(_.values(TAG_TYPES))*/, defaultValue: TAG_TYPES.TAG, allowNull: false}
}, {
  indexes: [
    {unique: true, fields: ['key', 'type']}
  ]
});

let UserJob = sequelize.define('user_jobs', {
  status: {type:Sequelize.ENUM('inbox','disliked','liked','applied','hidden'), defaultValue:'inbox', allowNull:false},
  note: Sequelize.TEXT
});

let UserTag = sequelize.define('user_tags', {
  score: {type:Sequelize.INTEGER, defaultValue:0, allowNull:false},
  locked: {type:Sequelize.BOOLEAN, defaultValue:false},
});

let Payment = sequelize.define('payments', {
  txn_id: {type: Sequelize.STRING,allowNull: false}
});

let Message = sequelize.define('messages', {
  to: {
    type: Sequelize.INTEGER,
    references: {model: User, key: 'id'}
  },
  subject: Sequelize.STRING,
  body: {type: Sequelize.TEXT, allowNull: false},
}, {
  classMethods: {
    hydrateMessages(to) {
      // see http://dba.stackexchange.com/questions/129263/multiple-to-jsonarray-agg-separate-joins
      return sequelize.query(`
        SELECT m.*, u.users, r.replies
        FROM messages m
        LEFT JOIN LATERAL (
          SELECT json_agg(u) AS users
          FROM (
            SELECT id, fullname, email, company, pic
            FROM users
            WHERE id IN (m.user_id, m.to)
          ) u
        ) u ON TRUE
        LEFT JOIN LATERAL (
          SELECT json_agg(r) AS replies
          FROM (
            SELECT *
            FROM messages
            WHERE message_id = m.id
            ORDER BY created_at
          ) r
        ) r ON TRUE
        WHERE :to IN (m.user_id, m.to) AND m.to IS NOT NULL
        `, { replacements: {to}, type: sequelize.QueryTypes.SELECT});
    }
  }
});

let Meta = sequelize.define('meta', {
  key: {type:Sequelize.STRING, primaryKey:true},
  val: Sequelize.STRING
}, {
  classMethods:{
    needsCron(){
      return sequelize.query(`SELECT EXTRACT(DOY FROM meta.val::TIMESTAMP WITH TIME ZONE)!=EXTRACT(DOY FROM CURRENT_TIMESTAMP) val FROM meta WHERE key='cron'`,
        {type:sequelize.QueryTypes.SELECT}).then(res => Promise.resolve((res[0].val)));
    },
    /**
     * @param skipScrape for tests (testing if refresh happens properly after #days)
     * @returns Promise
     */
    runCronIfNecessary(skipScrape) {
      return this.needsCron().then(val => {
        if (!val)
          return Promise.resolve();
        console.log('Refreshing jobs....');
        // Update cron, delete stale jobs
        return sequelize.query(`
          -- Update cron
          UPDATE meta SET val=CURRENT_TIMESTAMP WHERE key='cron';
          -- And prune old listings (10d for scraped, 30d for sponsored)
          DELETE FROM jobs WHERE
            (user_id IS NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL '10 days') OR
            (user_id IS NOT NULL AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days');
        `).then(() =>
          //FIXME require here, circular reference models.js/adaptors.js
          skipScrape ? Promise.resolve() : require('../lib/adaptors').refresh()
        );
      });
    }
  }
});

// Jobs have tags
Tag.belongsToMany(Job, {through: 'job_tags'});
Job.belongsToMany(Tag, {through: 'job_tags'});

// User sets job status [inbox|applied|liked|disliked]
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
  initDb
};