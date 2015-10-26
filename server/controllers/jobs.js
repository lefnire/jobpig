var db = require('../models/models');
var _ = require('lodash');
var adaptors = require('../lib/adaptors');

exports.mine = function(req, res, next){
  db.Job.findMine(req.user)
    .then(jobs=>res.json(jobs))
    .catch(next);
}

exports.list = function(req, res, next){
  db.Job.filterJobs(req.user, req.params.filter)
    .then(jobs=>res.send(jobs))
    .catch(next);
};

exports.create = function(req, res, next){
  db.Job.addCustom(req.user, req.body)
    .then(()=>res.sendStatus(200))
    .catch(next);
}

exports.addNote = function(req, res, next){
  db.UserJob.upsert({job_id:req.params.id, user_id:req.user.id, note:req.body.note})
    .then(()=>res.sendStatus(200))
    .catch(next);;
}

exports.setStatus = function(req, res, next){
  db.Job.score(req.user.id, req.params.id, req.params.status)
    .then(()=>res.sendStatus(200))
    .catch(next);
}

// Idea from https://www.drupal.org/project/poormanscron
exports.poormanscron = function(req, res, next) {
  db.Meta.runCronIfNecessary();
  res.sendStatus(200);
}