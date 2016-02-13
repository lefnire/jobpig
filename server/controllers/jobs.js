'use strict';
const db = require('../models/models');
const _ = require('lodash');
const adaptors = require('../lib/adaptors');


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

exports.create = function(req, res, next){
  req.body = _.omitBy(req.body, _.isEmpty);
  db.Job.addCustom(req.user, req.body)
    .then(() => res.send({}))
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

exports.getTags = (req, res, next) =>
  db.Tag.findAll().then(tags => res.send(tags)).catch(next);