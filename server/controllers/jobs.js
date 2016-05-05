'use strict';
const db = require('../models');
const _ = require('lodash');
const constants = require('../lib/constants');
const TAG_TYPES = constants.TAG_TYPES;
const FILTERS = constants.FILTERS;
const nconf = require('nconf');
const moment = require('moment');

exports.mine = function(req, res, next){
  db.Job.findMine(req.user)
    .then(jobs=> res.json(jobs))
    .catch(next);
}

exports.list = function(req, res, next){
  if (req.user.anon) {
    return db.Job.anonMatch(req.user)
      .then(job => res.json(job))
      .catch(next);
  }

  let filter = FILTERS[req.params.filter.toUpperCase()];
  db.Job.filterJobs(req.user, filter)
    .then(jobs => res.send(jobs))
    .catch(next);
};

exports.create = function(req, res, next) {
  // FIXME add some pre-validators here so it doesn't get through
  let body = req.body,
    user = req.user;

  // Allow finalizing draft jobs
  if (body.job_id && user.free_jobs > 0) {
    user.free_jobs--;
    return Promise.resolve([
      db.Job.update({pending: false}, {where: {id: body.job_id}}),
      user.save()
    ]).then(() => res.json({})).catch(next);
  }

  // Draft new job
  body.pending = !(user.free_jobs > 0);
  let p = [db.Job.addCustom(req.user.id, body)];
  if (user.free_jobs > 0) {
    user.free_jobs--;
    p.push(user.save());
  }
  Promise.all(p).then(vals => res.json(vals[0])).catch(next);
};

exports.addNote = function(req, res, next){
  db.UserJob.upsert({job_id: req.params.id, user_id: req.user.id, note: req.body.note})
    .then(() => res.send({}))
    .catch(next);
}

exports.setStatus = function(req, res, next){
  let status = +req.params.status;
  let user = req.user;
  if (!_.includes(_.values(FILTERS), status))
    return next({status: 400, message: 'Invalid status'});

  if (user.anon) {
    return db.Job.anonScore(user, req.params.id, status)
      .then(job => res.json({job, user})).catch(next);
  }

  db.Job.score(user.id, req.params.id, status)
    .then(()=> res.send({})).catch(next);
}

// Idea from https://www.drupal.org/project/poormanscron
let runCron = nconf.get('NODE_ENV') === 'production'
  ? _.debounce(() => db.Meta.runCronIfNecessary(), 60*60*1000)
  : db.Meta.runCronIfNecessary;

exports.poormanscron = function(req, res, next) {
  runCron();
  res.send({});
}

let _tags = {}; // {tags, debounce}
exports.getTags = (req, res, next) => {
  let type = +req.params.type;
  if (!_.includes(_.values(TAG_TYPES), type))
    return next({status: 400, message: 'Invalid tag type'});

  // Cache fetched tags for 1h (kinda heavy query). Rethink if too heavy on server memory
  if (_tags[type] &&
    moment().diff(_tags[type].debounce, 'hours') < 1) { // only fetch new tags every hour
    return Promise.resolve(res.send(_tags[type].tags))
  }

  db.Tag.findAll({
    where: {type, pending: false},
    attributes: ['key', 'type', 'text', 'id'],
    raw: true
  }).then(tags => {
    _tags[type] = {tags, debounce: moment()};
    res.send(tags)
  }).catch(next);
}