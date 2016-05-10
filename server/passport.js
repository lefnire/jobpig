'use strict';
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const nconf = require('nconf');
const User = require('./models').User;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('./lib/mail');
const Coupon = require('./models').Coupon;
const moment = require('moment');
const uuid = require('node-uuid').v4;

let anons = {};

const deny = (err, code) => ({status: code || 403, message: err.message || err});

exports.setup = app => {
  app.use(passport.initialize());
  passport.use(User.createStrategy());

  // For social-auth; can remove if those aren't in use
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  setupLinkedin(app, passport);
  setupFacebook(app, passport);

  var localOpts = {session:false, failWithError:true};
  app.post('/register', (req, res, next) => {
    let password = req.body.password,
      email = req.body.email,
      coupon = req.body.coupon;

    if (password !== req.body.confirmPassword)
      return next(deny('Password does not match Confirm Password'));

    if (password.length < 8)
      return next(deny('Password should be at least 8 characters.'));

    let pic = 'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(email).digest("hex");
    let userObj = {email, pic};

    let p = Promise.resolve();

    // hack handling of nfj experiment
    if (coupon === -1) {
      userObj.free_jobs = -1;
      coupon = false;
    }
    if (coupon) {
      p = Coupon.validate(coupon).then(found => {
        if (!found)
          throw deny("Coupon code invalid", 400); // have to throw to break promise chain
        userObj.free_jobs = found.value;
        coupon = found;
      });
    }
    p.then(() => new Promise((resolve, reject) =>
      User.register(userObj, password, (err, _user) => err? reject(deny(err)) : resolve(_user))
    )).then(_user => {
      coupon && coupon.destroy(); // invalidate applied coupons

      passport.authenticate('local', localOpts)(req, res, () => {
        res.json({token: sign(_user)});
      });

      // They were playing with sample jobs on front-page
      let anon = anons[req.headers['x-access-anon']];
      if (anon) {
        User.persistAnon(_user.id, anon);
        delete anons[anon.id];
      }

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

  app.post('/register/anon', (req, res, next) => {
    let id = uuid();
    anons[id] = {id, date: +new Date, anon: true, tags: [], jobs: {}};
    res.json(anons[id]);

    // Cleanup old job-browsing sessions previous users left behind
    _.each(anons, (anon) => {
      moment().diff(anon.date, 'minutes') > 15 && delete anons[anon.id];
    });
  });
  app.delete('/register/anon', (req, res, next) => {
    delete anons[req.headers['x-access-anon']];
  });

  app.post('/login', passport.authenticate('local', localOpts), function(req, res){
    res.json({token:sign(req.user)});
  });

  // FIXME add /logout to invalidate token, see https://github.com/roblevintennis/passport-api-tokens/blob/master/models/account.js
}

var sign = function(user) {
  var u = _.pick(user, ['id', 'email']);
  return jwt.sign(u, nconf.get('secret'), {
    expiresInMinutes: 60*24*7 // expires in 1 week
  });
}

exports.ensureAuth = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  if (!token) {
    let anon = anons[req.headers['x-access-anon']];
    if (!anon)
      return next({status: 403, message: 'No token provided.'});
    // Allow anonymous users limited functions
    req.user = anon;
    return next();
  }
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
};

function setupLinkedin(app, passport) {
  const redirectURL = nconf.get(`urls:${nconf.get('NODE_ENV')}:client`);
  const callbackURL = nconf.get(`urls:${nconf.get('NODE_ENV')}:server`)+"/auth/linkedin/callback";

  passport.use(new LinkedInStrategy({
    clientID: nconf.get('linkedin:key'),
    clientSecret: nconf.get('linkedin:secret'),
    callbackURL,
    scope: ['r_emailaddress', 'r_basicprofile'],
    //state: true, // we manually handle state, which we set to the anonymous-scoring id so we can persist that data
    passReqToCallback: true
  }, function (req, accessToken, refreshToken, profile, done) {
    let p = profile._json;
    User.findOne({where: {$or: {linkedin_id: p.id, email: p.emailAddress}}})
    .then(found => {
      if (found) return done(null, found);

      // Note: fake password (uuid); we _need_ a local registration (email & password)
      User.register({
        email: p.emailAddress || `${p.id}@linkedin.com`,
        linkedin_id: p.id,
        linkedin_url: p.publicProfileUrl,
        fullname: p.formattedName,
        pic: p.pictureUrl,
        bio: p.summary
      }, uuid(), (err, created) => {
        done(err, created && {id: created.id, email: created.email});

        // Persist anonymous scoring
        let anon = anons[req.query.state];
        if (anon) {
          User.persistAnon(created.id, anon);
          delete anons[req.query.state];
        }
      });
    }).catch(done);
  }));

  //app.get('/auth/linkedin', passport.authenticate('linkedin', {session: false}));
  app.get('/auth/linkedin', (req, res, next) => {
    passport.authenticate('linkedin', {
      session: false,
      state: req.query.anon || uuid()
    })(req, res, next);
  });

  app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    failureRedirect: redirectURL, // TODO handle failure
    session: false
  }), (req, res, next) => {
    res.redirect(redirectURL + '?jwt=' + sign(req.user)); // FIXME insecure!!
  });
}

function setupFacebook(app, passport) {
  const redirectURL = nconf.get(`urls:${nconf.get('NODE_ENV')}:client`);
  const callbackURL = nconf.get(`urls:${nconf.get('NODE_ENV')}:server`)+"/auth/facebook/callback";
  passport.use(new FacebookStrategy({
      clientID: nconf.get('facebook:app_id'),
      clientSecret: nconf.get('facebook:secret'),
      callbackURL,
      passReqToCallback: true,
      profileFields: ['id', 'displayName', 'email']
    },
    function(req, accessToken, refreshToken, profile, done) {
      let p = profile;
      User.findOne({where: {$or: {facebook_id: p.id, email: p.email}}})
        .then(found => {
          if (found) return done(null, found);

          // Note: fake password (uuid); we _need_ a local registration (email & password)
          User.register({
            email: p.email || `${p.id}@facebook.com`,
            facebook_id: p.id,
            fullname: p.displayName
          }, uuid(), (err, created) => {
            done(err, created && {id: created.id, email: created.email});

            // Persist anonymous scoring
            let anon = anons[req.session.anon];
            if (anon) {
              User.persistAnon(created.id, anon);
              delete anons[req.query.state];
              req.session.destroy();
            }
          });
        }).catch(done);
    }
  ));

  app.get('/auth/facebook', (req, res, next) => {
    req.session.anon = req.query.anon;
    passport.authenticate('facebook', {session: false})(req, res, next);
  });

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: redirectURL, // TODO handle failure
    session: false
  }), (req, res, next) => {
    res.redirect(redirectURL + '?jwt=' + sign(req.user)); // FIXME insecure!!
  });
}