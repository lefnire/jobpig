'use strict';

//Config
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });
require('./models/models');

//Express
var express = require('express'),
  app = express(),
  path = require('path');

app
//.use(favicon(__dirname + '/public/favicon.ico'));
.set('views', __dirname + '/views')
.set('view engine', 'jade')
.use(require('morgan')('dev'))
//.use(require('cors')())
.use(require('cookie-parser')())
.use(require('body-parser').json())
.use(require('method-override')())
//.use(require('connect-multiparty')())
//.use(require('cookie-session')({name: 'session', keys: ['key1', 'key2']}))
.use(require('express-session')({secret: 'passport-sequelize-sample', resave:false, saveUninitialized:false}));

require('./passport').setup(app);

app.use(express.static(path.join(__dirname, '..', 'client/build')));
app.use('/', require('./routes'));

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

module.exports = app;

if (process.env.NODE_ENV!=='test')
  app.listen(3000);