'use strict';

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
  passport = require('passport'),
  User = require('./models/user'),
  nconf = require('nconf');

exports.setup = function(app){

  // Express stuff
  app.use(passport.initialize())
    .use(passport.session());

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Linkedin profile is
  //   serialized and deserialized.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(new LinkedInStrategy({
    clientID: nconf.get('linkedin:key'),
    clientSecret: nconf.get('linkedin:secret'),
    callbackURL: "http://localhost:3000/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_basicprofile'],
    state: true,
  }, function(accessToken, refreshToken, profile, done) {
    //req.session.accessToken = accessToken;

    // To keep the example simple, the user's LinkedIn profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the LinkedIn account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
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
