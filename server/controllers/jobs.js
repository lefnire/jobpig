var db = require('../models/models');
var _ = require('lodash');
var adaptors = _.transform({'gunio':1, 'remoteok':1}, function (m, v, k) {
  m[k] = new (require(`../lib/adaptors/${k}`))();
});

exports.refresh = function (req, res, next) {
  _.each(adaptors, function (adaptor) {
    adaptor.list(function (err, jobs) {
      if (err) return next(err);
      db.Job.bulkCreateWithTags(jobs);
      res.sendStatus(200);
    })
  })
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
  var status = req.params.status;
  if (status=='1' || status=='-1') {
    db.UserTag.score(req.user.id, status, req.body); // .then(res.send)
    return res.sendStatus(200);
  }
  db.UserJob.upsert({job_id:req.params.id, user_id:req.user.id, status:req.params.status}).then(()=>res.sendStatus(200));
}

exports.expand = function (req, res, next) {
  db.Job.find({key:req.params.key}).then(function(job){
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
}