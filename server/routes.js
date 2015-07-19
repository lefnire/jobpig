'use strict';

var _ = require('lodash'),
  router = require('express').Router(),
  ensureAuth = require('./passport').ensureAuth,
  jobs = require('./controllers/jobs');

router.get('/', function(req, res, next){
  res.render('index', {user: req.user});
})

router.get('/jobs', ensureAuth, jobs.list);
router.post('/jobs', ensureAuth, jobs.create);
router.post('/jobs/refresh', ensureAuth, jobs.refresh);
router.get('/jobs/:key', ensureAuth, jobs.expand);
router.post('/jobs/:id/add-note', ensureAuth, jobs.addNote); //before :status, cascades
router.post('/jobs/:id/:status', ensureAuth, jobs.setStatus);

module.exports = router;


