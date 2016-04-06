'use strict';
const db = require('../models');
const _ = require('lodash');
const constants = require('../lib/constants');
const TAG_TYPES = constants.TAG_TYPES;
const FILTERS = constants.FILTERS;
const nconf = require('nconf');

exports.mine = function(req, res, next){
  db.Job.findMine(req.user)
    .then(jobs=> res.json(jobs))
    .catch(next);
}

exports.list = function(req, res, next){
  let filter = FILTERS[req.params.filter.toUpperCase()];
  db.Job.filterJobs(req.user, filter)
    .then(jobs => res.send(jobs))
    .catch(next);
};

exports.create = function(req, res, next) {
  // FIXME add some pre-validators here so it doesn't get through
  db.Job.addCustom(req.user.id, req.body)
    .then(job => res.send(job))
    .catch(next);
}

exports.addNote = function(req, res, next){
  db.UserJob.upsert({job_id:req.params.id, user_id:req.user.id, note:req.body.note})
    .then(() => res.send({}))
    .catch(next);
}

exports.setStatus = function(req, res, next){
  let status = +req.params.status;
  if (!_.includes(_.values(FILTERS), status))
    return next({status: 400, message: 'Invalid status'});
  db.Job.score(req.user.id, req.params.id, status)
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

exports.getTags = (req, res, next) => {
  let type = +req.params.type;
  if (!_.includes(_.values(TAG_TYPES), type))
    return next({status: 400, message: 'Invalid tag type'});
  db.Tag.findAll({where: {type, pending: {$not: true}}}).then(tags => res.send(tags)).catch(next);
  //db.Tag.findAll({where:{type: TAG_TYPES.SKILL}}).then(tags => res.send(tags)).catch(next);
}