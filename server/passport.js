'use strict';

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
  passport = require('passport'),
  nconf = require('nconf'),
  User = require('./models/models').User,
  _ = require('lodash'),
  jwt = require('jsonwebtoken');

exports.setup = function (app) {

  app.use(passport.initialize());

  passport.use(User.createStrategy());

  passport.use(new LinkedInStrategy({
    clientID: nconf.get('linkedin:key'),
    clientSecret: nconf.get('linkedin:secret'),
    callbackURL: nconf.get('urls:server')+"/auth/linkedin/callback",
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
    if (req.session.user) {
      return User.update(defaults, {where:{id: req.session.user.id}}).then(()=>done());
    }

    return done("FIXME: Standalone Linkedin profiles aren't yet supported, currently require a local-auth account to be tied to.")
    User.findOrCreate({
      where: {linkedin_id: profile.id},
      defaults: defaults,
    }).spread(function (user, created) {
      done(null, user);
      //user.get({plain: true}))
    })
  }));

  app.get('/auth/linkedin',
    exports.ensureAuth,
    function(req, res, next){
      req.session.user = req.user;
      next();
    },
    passport.authenticate('linkedin'));

  var redirectUrl = nconf.get('urls:client') + '/#/profile';
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {failureRedirect: redirectUrl}), (req, res, next)=>res.redirect(redirectUrl));

  app.post('/register', function (req, res, next) {
    if (req.body.password != req.body.confirmPassword)
      return next({status:403, message:'Password does not match Confirm Password'});
    User.register(User.build({email: req.body.email}), req.body.password, function (err, _user) {
      if (err) return next(err);
      //return res.sendStatus(200);
      passport.authenticate('local', {session:false})(req, res, ()=>{
        res.json({token: sign(_user)});
      });
    });
  });

  app.post('/login', passport.authenticate('local', {session:false}), function(req, res){
    res.json({token:sign(req.user)});
  });

  // FIXME add /logout to invalidate token, see https://github.com/roblevintennis/passport-api-tokens/blob/master/models/account.js
}

var sign = function(user) {
  var u = _.pick(user, ['id','email', 'remote_only'])// TODO do we need more variation? concerned about using _.omit & accidentally including too many sensitive attrs (see passport-local-sequelize)
  return jwt.sign(u, nconf.get('secret'), {
    expiresInMinutes: 1440 // expires in 24 hours
  });
}

exports.ensureAuth = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ error: 'No token provided.'});
  // decode token
  jwt.verify(token, nconf.get('secret'), function(err, decoded) {
    if (err) {
      return res.json({ error:'Failed to authenticate token.' });
    } else {
      // if everything is good, save to request for use in other routes
      req.user = decoded;
      next();
    }
  });
}
