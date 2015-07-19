'use strict';

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
  passport = require('passport'),
  nconf = require('nconf'),
  User = require('./models/models').User;

exports.setup = function(app){

  // Express stuff
  app.use(passport.initialize())
    .use(passport.session());

  // Passport session setup.
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id).then(function (user) {
      done(null, user)
    })
  });

  passport.use(new LinkedInStrategy({
    clientID: nconf.get('linkedin:key'),
    clientSecret: nconf.get('linkedin:secret'),
    callbackURL: "http://localhost:3000/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_basicprofile'],
    state: true,
  }, function(accessToken, refreshToken, profile, done) {
    //req.session.accessToken = accessToken;

    User.findOrCreate({
      where: {linkedin: profile.id},
      defaults: {linkedin: profile.id}
    }).spread(function(user, created) {
      done(null, user);
      //user.get({plain: true}))
    })
  }));

  app.get('/auth/linkedin',
    passport.authenticate('linkedin'));

  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function(req,res,next) {
      res.redirect('/');
    });


  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
}

exports.ensureAuth = function(req, res, next){
  if (req.isAuthenticated()) { return next(); }
  res.send(401, {error: 'Not authenticated.'});
}
