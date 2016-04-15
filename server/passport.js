'use strict';
const passport = require('passport');
const nconf = require('nconf');
const User = require('./models').User;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('./lib/mail');
const Coupon = require('./models').Coupon;

const deny = (err, code) => ({status: code || 403, message: err.message || err});

exports.setup = app => {
  app.use(passport.initialize());
  passport.use(User.createStrategy());

  var localOpts = {session:false, failWithError:true};
  app.post('/register', (req, res, next) => {
    let password = req.body.password,
      email = req.body.email,
      coupon = req.body.coupon;

    if (password !== req.body.confirmPassword)
      return next(deny('Password does not match Confirm Password'));

    if (password.length < 8)
      return next(deny('Password should be at least 8 characters.'));

    let pic = 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(email).digest("hex");
    let userObj = {email, pic};

    let p = Promise.resolve();
    if (coupon) p = Coupon.validate(coupon).then(found => {
      if (!found)
        throw deny("Coupon code invalid", 400); // have to throw to break promise chain
      userObj.free_jobs = found.value;
      coupon = found;
    });
    p.then(() => new Promise((resolve, reject) =>
      User.register(userObj, password, (err, _user) => err? reject(deny(err)) : resolve(_user))
    )).then(_user => {
      coupon && coupon.destroy(); // invalidate applied coupons

      passport.authenticate('local', localOpts)(req, res, () => {
        res.json({token: sign(_user)});
      });

      // Send acct activation email
      let link = nconf.get('urls:' + nconf.get('NODE_ENV') + ':server') +
        `/user/activate?email=${_user.email}&key=${_user.activationKey}`;
      mail.send({
        to: _user.email,
        subject: "Verify Jobpig email",
        text: `Verify your Jobpig account by clicking this link: ${link}`,
        html: `Verify your Jobpig account by clicking this link: <a href="${link}">${link}</a>`
      });
    }).catch(next);
  });

  app.post('/login', passport.authenticate('local', localOpts), function(req, res){
    res.json({token:sign(req.user)});
  });

  // FIXME add /logout to invalidate token, see https://github.com/roblevintennis/passport-api-tokens/blob/master/models/account.js
}

var sign = function(user) {
  var u = _.pick(user, ['id', 'email']);
  return jwt.sign(u, nconf.get('secret'), {
    expiresInMinutes: 1440 // expires in 24 hours
  });
}

exports.ensureAuth = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = /*req.body.token || req.query.token ||*/ req.headers['x-access-token'];
  if (!token)
    return next({status:403, message: 'No token provided.'});
  // decode token
  jwt.verify(token, nconf.get('secret'), (err, decoded) => {
    if (err)
      return next({status:403, message:'Failed to authenticate token.'});
    // if everything is good, save to request for use in other routes. Note we don't do req.user=decoded, since that
    // contains stale data
    User.findById(decoded.id).then(user => {
      req.user = user;
      next();
    });
  });
}
