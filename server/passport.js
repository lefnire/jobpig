'use strict';

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
  passport = require('passport'),
  nconf = require('nconf'),
  User = require('./models/models').User,
  _ = require('lodash');

exports.setup = function (app) {

  // Express stuff
  app.use(passport.initialize())
    .use(passport.session());

  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  //FIXME figure out how to make linkedin & local work together, see passport-local-sequelize#defaultUserSchema

  // Passport session setup.
  /*passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
      done(null, user)
    })
  });*/

  passport.use(new LinkedInStrategy({
    clientID: nconf.get('linkedin:key'),
    clientSecret: nconf.get('linkedin:secret'),
    callbackURL: "http://localhost:3000/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_basicprofile'],
    state: true,
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    var defaults = {
      linkedin_id: profile.id,
      linkedin_url: profile._json.publicProfileUrl,
      fullname: profile.displayName,
      pic: profile.photos[0],
      bio: profile._json.summary
    }
    if (req.user) {
      _.each(defaults, (v,k)=>{req.user[k]=v})
      return req.user.save().then(()=>done());
    }

    User.findOrCreate({
      where: {linkedin_id: profile.id},
      defaults: defaults,
    }).spread(function (user, created) {
      done(null, user);
      //user.get({plain: true}))
    })
  }));

  app.get('/auth/linkedin',
    passport.authenticate('linkedin'));

  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {failureRedirect: '/#/profile'}), (req, res, next)=>res.redirect('/#/profile'));

  app.post('/register', function (req, res, next) {
    if (req.body.password != req.body.confirmPassword)
      return next({status:403, message:'Password does not match Confirm Password'});
    User.register(User.build({email: req.body.email}), req.body.password, function (err, _user) {
      if (err) return next(err);
      //return res.sendStatus(200);
      passport.authenticate('local')(req, res, ()=>res.redirect('/'));
    });
  });

  app.post('/login', passport.authenticate('local'), (req, res)=>res.redirect('/'));

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

}

exports.ensureAuth = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({error: 'Not authenticated.'});
}
