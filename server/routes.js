'use strict';

var _ = require('lodash'),
  adaptors = _.transform({'gunio': null, 'remoteok': null}, function (m, v, k) {
    m[k] = new (require(`./adaptors/${k}`))();
  }),
  router = require('express').Router(),
  ensureAuth = require('./passport').ensureAuth;

router.get('/', function(req, res, next){
  console.log({user:req.user});
  res.render('index', {user: req.user});
})

router.post('/jobs', ensureAuth, function (req, res, next) {
  _.each(adaptors, function (adaptor) {
    adaptor.list(function (err, jobs) {
      if (err) return next(err);
      _.each(jobs, function (job) {
        let c = ref.child(job.key);
        c.once('value', function (snap) {
          let v = snap.val();
          if (!(v && v.status)) job.status = 'inbox';
          c.update(job);
        })
      })
    })
  })
  res.sendStatus(200);
});

router.get('/jobs/:key', ensureAuth, function (req, res, next) {
  ref.child(req.params.key).once('value', function (snap) {
    let job = snap.val();
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
});

module.exports = router;


