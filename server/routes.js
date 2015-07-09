'use strict';

var _ = require('lodash'),
  adaptors = _.transform({'gunio': null, 'remoteok': null}, function (m, v, k) {
    m[k] = new (require(`./adaptors/${k}`))();
  }),
  nconf = require('nconf'),
  passport = require('passport'),
  User = require('./models/user'),
  router = require('express').Router();

router.get('/', function (req, res) {
  res.send('System go.');
});

router.post('/jobs', function (req, res, next) {
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

router.get('/jobs/:key', function (req, res, next) {
  ref.child(req.params.key).once('value', function (snap) {
    let job = snap.val();
    adaptors[job.source].expand(job, function (err, deets) {
      if (err) return next(err);
      res.send(deets);
    })
  })
});


// passport-local example
router.get('/', function (req, res) {
  res.render('index', {user: req.user});
})
router.get('/register', function (req, res) {
  res.render('register', {});
})
router.post('/register', function (req, res, next) {
  console.log('registering user');
  User.register(new User({username: req.body.username}), req.body.password, function (err) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }
    console.log('user registered!');
    res.redirect('/');
  });
})
router.get('/login', function (req, res) {
  res.render('login', {user: req.user});
})
router.post('/login', passport.authenticate('local'), function (req, res) {
  res.redirect('/');
})
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

return;



