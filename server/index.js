'use strict';

//Config
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

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
//.use(require('cookie-session')({ keys: ['secretkey1', 'secretkey2', '...']}));
.use(require('express-session')({ secret: 'keyboard cat' }));

require('./passport').setup(app);

app.use(express.static(path.join(__dirname, '..', 'client/build')));

app.use('/', require('./routes'))

.listen(3000);
