'use strict';
//Config
const nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

if (nconf.get('NODE_ENV') === 'production')
  require('newrelic');

require('./models');

//Express
const express = require('express'),
  app = express(),
  path = require('path'),
  bodyParser = require('body-parser');

app
//.use(favicon(__dirname + '/public/favicon.ico'));
.set('views', __dirname + '/views')
.set('view engine', 'jade')
.use(require('morgan')('dev'))
.use(require('cors')())
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: false }))
.use(require('method-override')())
//.use(require('connect-multiparty')())
//.use(require('express-session')({secret: nconf.get('secret'), resave:false, saveUninitialized:false})); //fixme used only for linkedin redirect, can we remove this?

require('./passport').setup(app);

app.use(express.static(path.join(__dirname, '..', 'client/build')));
app.use('/', require('./routes'));

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  if (err.name == 'AuthenticationError') // Passport just gives us "Unauthorized", not sure how to get specifics
    err = {status:401, message:"Login failed, please check email address or password and try again."};
  res
    .status(err.status || 500)
    .json({message: err.message || err});
});

module.exports = app;

if (process.env.NODE_ENV!=='test')
  app.listen(nconf.get('PORT') || 3000);
