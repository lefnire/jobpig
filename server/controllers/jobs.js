var db = require('../models/models');
var _ = require('lodash');
var adaptors = _.reduce([
  //'gunio',
  //'remoteok',
  //'stackoverflow',
  //'github',
  'authenticjobs'
], function (m, v, k) {
  m[v] = new (require(`../lib/adaptors/${v}`))();
  return m;
}, {});

exports.refresh = function (req, res, next) {
  _.each(adaptors, function (adaptor) {
    adaptor.list(function (err, jobs) {
      if (err) return next(err);
      db.Job.bulkCreateWithTags(jobs);
    })
  })
  res.sendStatus(200);
};

exports.list = function(req, res, next){
  db.Job.filterByUser(req.user.id).then((jobs)=>res.send(jobs));
};

exports.create = function(req, res, next){
  db.Job.addCustom(req.user.id, req.body);
  res.sendStatus(200);
}

exports.addNote = function(req, res, next){
  db.UserJob.upsert({job_id:req.params.id, user_id:req.user.id, note:req.body.note});
}

exports.setStatus = function(req, res, next){
  db.Job.score(req.user.id, req.params.id, req.params.status, req.query.force);
  res.sendStatus(200);
}

exports.expand = function (req, res, next) {
  db.Job.find({key:req.params.key}).then(function(job){
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
}