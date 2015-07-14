'use strict';

var _ = require('lodash'),
  adaptors = _.transform({'gunio': null, 'remoteok': null}, function (m, v, k) {
    m[k] = new (require(`./adaptors/${k}`))();
  }),
  router = require('express').Router(),
  ensureAuth = require('./passport').ensureAuth,
  Job = require('./db').Job,
  Tag = require('./db').Tag;

router.get('/', function(req, res, next){
  res.render('index', {user: req.user});
})

router.post('/refresh', ensureAuth, function (req, res, next) {
  _.each(adaptors, function (adaptor) {
    adaptor.list(function (err, jobs) {
      if (err) return next(err);
      _.each(jobs, function (job) {
        //FIXME find-or-create, update existing attrs
        Job.create(job).then(function(_job){
          //if (!(v && v.status)) job.status = 'inbox';
          job.tags.forEach(function(tag){
            Tag.create({key:tag,text:tag}).then(function(_tag){
              _job.addTag(_tag);
            })
          })
          res.sendStatus(200);
        })
      })
    })
  })
});

router.get('/jobs', ensureAuth, function(req, res, next){
  Job.findAll({
    include: [{
      model: Tag,
      //where: { state: Sequelize.col('project.state') }
    }]
  }).then(function(jobs){
    res.send(jobs);
  })
});

router.post('/jobs/:key/:status', ensureAuth, function(req, res, next){
  Job.update({status:req.params.status}, {where:{key:req.params.key}}).then(function(){
    res.send(200);
  });
})

router.get('/jobs/:key', ensureAuth, function (req, res, next) {
  Job.find({key:req.params.key}).then(function(job){
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
});

module.exports = router;


