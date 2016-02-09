'use strict';

const passport = require('passport'),
  nconf = require('nconf'),
  User = require('./models/models').User,
  _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  crypto = require('crypto');

exports.setup = function (app) {
  app.use(passport.initialize());
  passport.use(User.createStrategy());

  var localOpts = {session:false, failWithError:true};
  app.post('/register', function (req, res, next) {
    if (req.body.password != req.body.confirmPassword)
      return next({status:403, message:'Password does not match Confirm Password'});
    if (req.body.password.length < 3)
      return next({status:403, message:'Password should be greater than 3 characters.'});
    User.register(User.build({
      email: req.body.email,
      pic: 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(req.body.email).digest("hex")
    }), req.body.password, function (err, _user) {
      if (err) return next(err);
      //return res.sendStatus(200);
      passport.authenticate('local', localOpts)(req, res, ()=>{
        res.json({token: sign(_user)});
      });
    });
  });

  app.post('/login', passport.authenticate('local', localOpts), function(req, res){
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
    return next({status:403, message: 'No token provided.'});
  // decode token
  jwt.verify(token, nconf.get('secret'), function(err, decoded) {
    if (err) {
      return next({status:403, message:'Failed to authenticate token.'});
    } else {
      // if everything is good, save to request for use in other routes
      req.user = decoded;
      next();
    }
  });
}
