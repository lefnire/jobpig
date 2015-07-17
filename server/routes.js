'use strict';

var _ = require('lodash'),
  adaptors = _.transform({'gunio': null, 'remoteok': null}, function (m, v, k) {
    m[k] = new (require(`./adaptors/${k}`))();
  }),
  router = require('express').Router(),
  ensureAuth = require('./passport').ensureAuth;

//var {Job,Tag,UserJob,UserTag} = require('./db'); //fixme why not working?
var db = require('./db');

router.get('/', function(req, res, next){
  res.render('index', {user: req.user});
})

router.post('/refresh', ensureAuth, function (req, res, next) {
  _.each(adaptors, function (adaptor) {
    adaptor.list(function (err, jobs) {
      if (err) return next(err);
      db.Job.bulkCreateWithTags(jobs);
      res.sendStatus(200);
    })
  })
});

router.get('/jobs', ensureAuth, function(req, res, next){
  db.Job.filterByUser(req.user.id).then((jobs)=>res.send(jobs));
});

router.post('/jobs/:id/:status', ensureAuth, function(req, res, next){
  var status = req.params.status;
  if (status=='1' || status=='-1') {
    db.UserTag.score(req.user.id, status, req.body); // .then(res.send)
    return res.sendStatus(200);
  }
  db.UserJob.upsert({job_id:req.params.id, user_id:req.user.id, status:req.params.status}).then(()=>res.sendStatus(200));
})

router.get('/jobs/:key', ensureAuth, function (req, res, next) {
  db.Job.find({key:req.params.key}).then(function(job){
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
});

module.exports = router;


