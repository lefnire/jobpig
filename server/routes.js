'use strict';
const _ = require('lodash'),
  router = require('express').Router(),
  ensureAuth = require('./passport').ensureAuth,
  jobs = require('./controllers/jobs'),
  user = require('./controllers/user'),
  payments = require('./controllers/payments');

router.get('/', function(req, res){
  res.sendStatus(200);
})

router.post('/payments', payments.validate);

router.get('/user', ensureAuth, user.get);
router.put('/user/:table/:id', ensureAuth, user.override);
router.delete('/user/:table/:id', ensureAuth, user.override);
router.put('/user/preferences', ensureAuth, user.setPref);
router.get('/user/messages', ensureAuth, user.getMessages);
router.post('/user/seed-tags', ensureAuth, user.seedTags);

router.get('/jobs/cron', jobs.poormanscron);
router.get('/jobs/mine', ensureAuth, jobs.mine);
router.get('/jobs/tags', jobs.getTags);
router.get('/jobs/:filter?', ensureAuth, jobs.list);
router.post('/jobs', ensureAuth, jobs.create);
router.post('/jobs/:id/add-note', ensureAuth, jobs.addNote); //before :status, cascades
router.post('/jobs/:id/:status', ensureAuth, jobs.setStatus);

module.exports = router;
