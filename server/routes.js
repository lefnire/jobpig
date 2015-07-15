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
      _.each(jobs, function (job) {
        //FIXME find-or-create, update existing attrs
        db.Job.create(job).then(function(_job){
          //if (!(v && v.status)) job.status = 'inbox';
          job.tags.forEach(function(tag){
            db.Tag.create({key:tag,text:tag}).then(function(_tag){
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
  return db.Job.findAll({
    attributes: _.keys(db.Job.attributes).concat([
      [sequelize.literal(`COALESCE("Users.UserJob"."status",'inbox')`), 'status']
    ]),
    include:[db.Tag, db.User]
  }).then((jobs)=>res.send(jobs));

  //--------------------------------------------------------
  // Raw SQL Attempt
  //--------------------------------------------------------
  /*var jobAttrs = 'id budget company description key location source status title url'.split(' ').map((k)=>`"Job"."${k}"`).join(', ');
  var tagAttrs = 'id key text'.split(' ').map((k)=>`"Tags"."${k}" AS "Tags.${k}"`).join(', ');
  var query = `
    SELECT ${jobAttrs}, ${tagAttrs}
    FROM "Jobs" AS "Job"
    LEFT OUTER JOIN
    ("JobTag" AS "Tags.JobTag" INNER JOIN "Tags" AS "Tags" ON "Tags"."id" = "Tags.JobTag"."TagId")
    ON "Job"."id" = "Tags.JobTag"."JobId"`;
  return global.sequelize.query(query, {type: sequelize.QueryTypes.SELECT}).then((projects)=>res.send(projects));*/
});

router.post('/jobs/:id/:status', ensureAuth, function(req, res, next){
  db.UserJob.upsert({JobId:req.params.id, UserId:req.user.id, status:req.params.status}).then(()=>res.sendStatus(200));
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


