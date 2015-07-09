'use strict';

//Config
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

//Express
var express = require('express'),
  passport = require('passport'),
  User = require('./models/user'),
  app = express();

app
//.use(favicon(__dirname + '/public/favicon.ico'));
.use(require('morgan')('dev'))
.use(require('cors')())
.use(require('body-parser').json())
//.use(require('connect-multiparty')())
//.use(require('method-override')())
.use(require('cookie-parser')())
.use(require('cookie-session')({ keys: ['secretkey1', 'secretkey2', '...']}));

// passport-local-sequelize
app.use(passport.initialize())
.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', require('./routes'))
.listen(3001);
