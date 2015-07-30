'use strict';

var _ = require('lodash');
var nightmare = new (require('nightmare'))();
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require('request');
var db = require('../../models/models');

exports.Adaptor = class Adaptor {
  constructor() {
    this.nightmare = nightmare;
  }

  fetchFeed(url, cb) {
    request(url, (err, response, body)=> {
      if (err) return cb(err);
      parser.parseString(body, cb);
    });
  }

  list(done, err, jobs) {
    _.each(jobs, function (job) {
      // job ids in database are alphanumeric URLs (in case of repeats from other websites)
      job.key = job.key || job.url.replace(/\W+/g, "");
    })
    done(err, jobs);
  }

  addTagsFromContent(jobs, cb) {
    db.Tag.findAll({fields: ['key']}).then(tags=> {
      _.each(jobs, job=> {
        job.tags = _.reduce(tags, (m, v)=> {
          // check whole word, but allow for punctuation
          if (RegExp(`[!a-zA-Z]${_.escapeRegExp(v.key)}[!a-zA-Z]`, 'gi').test(job.description))
            m.push(v.key);
          return m;
        }, []);
      })
      cb(null, jobs);
    })
  }

  addRemoteFromContent(jobs) {
    _.each(jobs, job=> {
      job.remote = /(remote|telecommut)/gi.test(job.description); // telecommute, telecommuting
    });
  }
}

var adaptors = _.reduce([
  'gunio',
  'remoteok',
  'stackoverflow',
  'github',
  //'authenticjobs'
], function (m, v, k) {
  m[v] = new (require(`./${v}`))();
  return m;
}, {});

exports.refresh = function () {
  _.each(adaptors, function (adaptor) {
    adaptor.list(function (err, jobs) {
      if (err) return next(err);
      db.Job.bulkCreateWithTags(jobs);
    })
  })
}