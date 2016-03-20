'use strict';
const db = require('../models/models');
const _ = require('lodash');
const adaptors = require('../lib/adaptors');
const TAG_TYPES = require('../lib/constants').TAG_TYPES;

exports.mine = function(req, res, next){
  db.Job.findMine(req.user)
    .then(jobs=> res.json(jobs))
    .catch(next);
}

exports.list = function(req, res, next){
  db.Job.filterJobs(req.user, req.params.filter)
    .then(jobs=> res.send(jobs))
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
  db.Job.score(req.user.id, req.params.id, req.params.status)
    .then(()=> res.send({}))
    .catch(next);
}

// Idea from https://www.drupal.org/project/poormanscron
exports.poormanscron = function(req, res, next) {
  db.Meta.runCronIfNecessary();
  res.send({});
}

exports.getTags = (req, res, next) => {
  let type = +req.params.type;
  if (!_.includes(_.values(TAG_TYPES), type))
    return next({status: 400, message: 'Invalid tag type'});
  db.Tag.findAll({where: {type}}).then(tags => res.send(tags)).catch(next);
  //db.Tag.findAll({where:{type: TAG_TYPES.TAG}}).then(tags => res.send(tags)).catch(next);
}