//Helpers
var _ = require('lodash');

//Config
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

//Adaptors
var gunio = require('./adaptors/gunio');

//Firebase
var Firebase = require("firebase");
var ref = new Firebase("https://lefnire-test.firebaseIO.com/jobs");

//Express
var express = require('express');
var app = express();
app
.set('views', './views')
.set('view engine', 'jade')
.use('/bower_components', express.static('bower_components'))

.get('/', function(req, res) {
  res.render('index');
})

.post('/jobs', function(req, res, next){
  gunio(function(err, jobs){
    if (err) return next(err);
    ref.set(
      _.reduce(jobs, function(m,v,k){
        // job ids in database are alphanumeric URLs (in case of repeats from other websites)
        //TODO set each object field-by-field, so we can keep other attrs (discarded, saved, etc)
        m[v.url.replace(/\W+/g, "")] = v;return m;
      }, {})
    );
  })
  res.sendStatus(200);
})

.listen(3000);
