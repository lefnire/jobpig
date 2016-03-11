'use strict';
const _ = require('lodash'),
  router = require('express').Router(),
  ensureAuth = require('./passport').ensureAuth,
  jobs = require('./controllers/jobs'),
  user = require('./controllers/user'),
  payments = require('./controllers/payments'),
  messages = require('./controllers/messages');

router.get('/', function(req, res){
  res.sendStatus(200);
})

router.post('/payments', payments.validate);

router.get('/user', ensureAuth, user.get);
router.put('/user/:table/:id', ensureAuth, user.override);
router.delete('/user/:table/:id', ensureAuth, user.override);
router.put('/user/preferences', ensureAuth, user.setPref);
router.post('/user/seed-tags', ensureAuth, user.seedTags);
router.get('/user/activate', user.activate);
router.post('/user/forgot-password', user.forgotPassword);
router.get('/user/reset-password', user.resetPasswordPage);
router.post('/user/reset-password', user.resetPassword);

router.get('/messages', ensureAuth, messages.inbox);
router.get('/messages/sent', ensureAuth, messages.sent);
router.post('/messages/contact/:uid', ensureAuth, messages.contact);
router.post('/messages/reply/:mid', ensureAuth, messages.reply);
router.delete('/messages/:mid', ensureAuth, messages.remove);

router.get('/jobs/cron', jobs.poormanscron);
router.get('/jobs/mine', ensureAuth, jobs.mine);
router.get('/jobs/tags', jobs.getTags);
router.get('/jobs/:filter?', ensureAuth, jobs.list);
router.post('/jobs', ensureAuth, jobs.create);
router.post('/jobs/:id/add-note', ensureAuth, jobs.addNote); //before :status, cascades
router.post('/jobs/:id/:status', ensureAuth, jobs.setStatus);

module.exports = router;
