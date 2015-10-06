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

  fetchFeed(url) {
    return new Promise((resolve,reject)=>{
      request(url, (err, response, body)=> {
        if (err) return reject(err);
        parser.parseString(body, (err, results)=>resolve(results));
      });
    })
  }

  refresh(jobs) {
    _.each(jobs, job=>{
      // job ids in database are alphanumeric URLs (in case of repeats from other websites)
      job.key = job.key || job.url.replace(/\W+/g, "");
    })
    return db.Job.bulkCreateWithTags(jobs);
  }

  addTagsFromContent(jobs) {
    return db.Tag.findAll({attributes: ['key']}).then(tags=> {
      _.each(jobs, job=> {
        job.tags = _.reduce(tags, (m, v)=> {
          // check whole word, but allow for punctuation
          if (RegExp(`[^a-zA-Z\d]${_.escapeRegExp(v.key)}[^a-zA-Z\d]`, 'gi').test(job.description))
            m.push(v.key);
          return m;
        }, []);
      })
      return new Promise((resolve)=>resolve(jobs));
    })
  }

  addRemoteFromContent(jobs) {
    _.each(jobs, job=> {
      job.remote = /(remote|telecommut)/gi.test(job.description); // telecommute, telecommuting
    });
  }
}

var adaptors = _.reduce([
  //'gunio',
  //'remoteok',
  'stackoverflow',
  'github',
  'authenticjobs',
  'weworkremotely',
  'wfh',
  'jobspresso',
], function (m, v, k) {
  m[v] = new (require(`./${v}`))();
  return m;
}, {});

exports.adaptors = adaptors;

exports.refresh = function () {
  //return Promise.all( _.map(exports.adaptors, a=>a.refresh() ));

  // seed tags
  var promises = _.reduce(adaptors, (m,v,k)=>{
    m[v.seedsTags ? 'seedsTags' : 'needsTags'].push(v);
    return m;
  }, {seedsTags:[], needsTags:[]});
  return Promise.all(promises.seedsTags.map(a=>a.refresh())).then(()=>{
    return Promise.all(promises.needsTags.map(a=>a.refresh()));
  })
}