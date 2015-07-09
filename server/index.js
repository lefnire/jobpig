'use strict';

//Helpers
var _ = require('lodash');

//Config
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

//Adaptors
var adaptors = _.transform({'gunio':null, 'remoteok':null}, function(m,v,k){
  m[k] = new (require(`./adaptors/${k}`))();
})

//Firebase
var Firebase = require("firebase");
var ref = new Firebase("https://lefnire-test.firebaseIO.com/jobs");

//Express
var express = require('express');
var app = express();
app
//.set('views', './views')
//.set('view engine', 'jade')
//.use('/bower_components', express.static('bower_components'))

.get('/', function(req, res) {
  res.send('System go.');
})

.post('/jobs', function(req, res, next){
  _.each(adaptors, function(adaptor){
    adaptor.list(function(err, jobs){
      if (err) return next(err);
      _.each(jobs, function(job){
        ref.child(job.key).update(job);
      })
    })
  })
  res.sendStatus(200);
})

.get('/jobs/:key', function(req, res, next){
  ref.child(req.params.key).once('value', function(snap){
    let job = snap.val();
    adaptors[job.source].expand(job, function(err, deets){
      if (err) return next(err);
      res.send(deets);
    })
  })
})

.listen(3001);
