var db = require('../models/models');
var _ = require('lodash');
var adaptors = require('../lib/adaptors');

exports.mine = function(req, res, next){
  db.Job.findMine(req.user)
    .then(jobs=>res.json(jobs));
}

exports.list = function(req, res, next){
  db.Meta.runCronIfNecessary(); // FIXME: Where to put this?
  db.Job.filterJobs(req.user, req.params.filter).then(jobs=>res.send(jobs));
};

exports.create = function(req, res, next){
  db.Job.addCustom(req.user, req.body).then(()=>res.sendStatus(200));
}

exports.addNote = function(req, res, next){
  db.UserJob.upsert({job_id:req.params.id, user_id:req.user.id, note:req.body.note});
}

exports.setStatus = function(req, res, next){
  db.Job.score(req.user.id, req.params.id, req.params.status).then(()=>res.sendStatus(200));
}

exports.expand = function (req, res, next) {
  db.Job.find({key:req.params.key}).then(function(job){
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
}