'use strict';
const constants = require('../lib/constants');
const utils = require('../lib/utils');
const FILTERS = constants.FILTERS;
const TAG_TYPES = constants.TAG_TYPES;
const Sequelize = require('sequelize');
const sanitizeHtml = require('sanitize-html');
const _ = require('lodash');
const uuid = require('node-uuid');
const Tag = require('./tag');
const UserJob = require('./user_job');

let Job = sequelize.define('jobs', {
  description: Sequelize.TEXT,
  key: {type:Sequelize.STRING, allowNull:false, unique:true},
  title: {type:Sequelize.STRING, allowNull:false},
  url: {type:Sequelize.STRING, allowNull:false},
  pending: {type: Sequelize.BOOLEAN, defaultValue: false},

  // Stats
  likes: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
  dislikes: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
  views: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}
}, {
  classMethods: {
    filterJobs(user, status) {
      status = status || FILTERS.MATCH;
      let q = `
        SELECT
        j.*
        ,COALESCE(uj.status, :match) status
        ,uj.note
        ,json_agg(tags) tags
        ,COALESCE(SUM(ut.score),0) score

        FROM jobs j

        LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
        LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.user_id=:user_id
        LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id

        WHERE j.pending <> TRUE
        GROUP BY j.id, uj.note, uj.status
        HAVING COALESCE(uj.status, :match) = :status AND COALESCE(SUM(ut.score),0)>-75
        ORDER BY score DESC,
          j.user_id::BOOLEAN ASC, -- (NULLS LAST) show custom jobs first
          -- length(j.description) DESC, -- show "fuller" jobs first; TODO fix hydration
          j.created_at DESC
        LIMIT :limit;
      `;

      // new system (ML). TODO this is copy/paste/modify from above, consolidate
      if (status === FILTERS.MATCH) {
        q = `SELECT j.*, uj.status, uj.note, json_agg(tags) tags, 0 as score

        FROM jobs j

        LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
        LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.user_id=:user_id
        LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id

        WHERE j.pending <> TRUE
        GROUP BY j.id, uj.note, uj.status
        HAVING uj.status = :status
        ORDER BY j.user_id::BOOLEAN ASC, -- (NULLS LAST) show custom jobs first
          j.created_at DESC
        LIMIT :limit;`;
      }
      return sequelize.query(q, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          status,
          match: FILTERS.MATCH,
          user_id: user.id,
          limit: status === FILTERS.MATCH ? 1 : 50
        },
      }).then(jobs => {
        // Update statistics
        if (status === FILTERS.MATCH && jobs[0]) {
          sequelize.query(`UPDATE jobs SET views = views + 1 WHERE id = :id`, {
            replacements: {id: jobs[0].id}
          });
        }
        return Promise.resolve(jobs);
      })
    },
    anonMatch(user) {
      // FIXME is this safe? I'm casting to INT, which should mitigate SQL injection...
      let values = user.tags.map(t => `(${+t.id}, ${+t.score})`).join(',');
      let jids = _.keys(user.jobs);
      if (_.isEmpty(jids)) jids = [0];
      return sequelize.query(`
        SELECT
        j.*
        ,json_agg(tags) tags
        ,COALESCE(SUM(ut.score),0) score

        FROM jobs j

        LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
        LEFT JOIN (VALUES ${values}) AS ut (tag_id, score) ON ut.tag_id=jt.tag_id

        WHERE j.pending <> TRUE AND j.id NOT IN (:jids)
        GROUP BY j.id
        HAVING COALESCE(SUM(ut.score),0)>-75
        ORDER BY score DESC, j.created_at DESC
        LIMIT 1;
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {jids}
      }).then(jobs => Promise.resolve(jobs && jobs[0] || {}));
    },
    anonScore(user, job_id, status) {
      return Job.findById(job_id, {
        attributes: ['id'],
        include: {model: Tag, attributes: ['id', 'text']}
      }).then(job => {
        let score = {[FILTERS.LIKED]: 1, [FILTERS.DISLIKED]: -1}[status];
        job.tags.forEach(tag => {
          let found = _.find(user.tags, {id: tag.id});
          if (!found) {
            found = {id: tag.id, score: 0, text: tag.text};
            user.tags.push(found);
          }
          found.score += score;
        });
        user.jobs[job_id] = status;
        return Job.anonMatch(user);
      });
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
            job.description = sanitizeHtml(job.description); // remove unsafe tags // TODO make this a hook instead?

            job.tags = _(job.tags)
              .map(text => ({text, key: text, type: TAG_TYPES.SKILL})) // turn into tag objects
              .concat([ // add other job meta
                {key: job.company, text: job.company, type: TAG_TYPES.COMPANY},
                {key: job.location, text: job.location, type: TAG_TYPES.LOCATION},
                {key: job.source, text: job.source, type: TAG_TYPES.SOURCE},
                {key: job.commitment, text: job.commitment, type: TAG_TYPES.COMMITMENT},
                {key: job.remote ? 'remote' : null, text: 'Remote', type: TAG_TYPES.SKILL} // tag so they can use in seeding
              ])
              .filter('key') // remove empty vals
              .map(tag => _.assign(tag, {
                key: utils.textToKey(tag.key)
              }))
              .value();
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
          url: job.url || 'http://jobpigapp.com', // FIXME need job.id to set the real url; replacing url in other locations
          pending: job.pending // Set to true after they've paid; false if they have free jobs (coupons)
        }).value();
      return this.bulkCreateWithTags([job])
        .then(() => Job.findOne({where:{key}}));
    },

    score(user_id, job_id, status){
      // First set its status
      let setStatus = UserJob.upsert({user_id,job_id,status});

      // Then score attributes, unless setting to 'match' or 'hidden'
      // hidden means "hide this post, but don't hurt it" (maybe repeats of something you've already applied to)
      let score = ~[FILTERS.MATCH, FILTERS.HIDDEN].indexOf(status) ? 0 : status === FILTERS.DISLIKED ? -1 : +1;
      if (!score)
        return setStatus;

      let stat = {[FILTERS.DISLIKED]: 'dislikes', [FILTERS.LIKED]: 'likes'}[status];

      return Promise.all([
        // Status
        setStatus,

        // Tags & Stats
        sequelize.query(`
          -- Bulk create any missing user_tags
          INSERT INTO user_tags (user_id, tag_id, score, locked, created_at, updated_at)
          SELECT :user_id, t.tag_id, 0, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          FROM (SELECT tag_id FROM job_tags WHERE job_id=:job_id EXCEPT SELECT tag_id FROM user_tags WHERE user_id=:user_id) t;

          -- Then increment their score
          UPDATE user_tags SET score=score+:score
          WHERE tag_id IN (SELECT tag_id FROM job_tags WHERE job_id=:job_id) AND user_id=:user_id AND locked<>true;

          -- Update stats
          ${stat? `UPDATE jobs SET ${stat} = ${stat} + 1 WHERE id = :job_id;`: ''}
        `, {replacements: {user_id, job_id, score}})
      ]);
    }
  },
  indexes: [
    {unique: true, fields: ['key']}
  ]
});

module.exports = Job;