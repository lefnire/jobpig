'use strict';

let _ = require('lodash');
let nightmare = new (require('nightmare'))();
let xml2js = require('xml2js');
let parser = new xml2js.Parser();
let request = require('request');
let db = require('../../models/models');

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

  _refresh() {
    return this.refresh()
      .then(jobs=> {
        jobs.forEach(job=> {
          // job ids in database are alphanumeric URLs (in case of repeats from other websites)
          job.key = job.key || job.url.replace(/\W+/g, "");
          job.tags = job.tags || [];
        })
        return this.addTagsFromContent(jobs);
      })
      .then(jobs=> db.Job.bulkCreateWithTags(jobs) );
  }

  addTagsFromContent(jobs) {
    return db.Tag.findAll({attributes: ['key']}).then(tags=> {
      jobs.forEach(job=> {
        job.tags = job.tags.concat(
          _.reduce(tags, (m, v)=> {
            // check whole word, but allow for punctuation
            let exp = RegExp(`\\b${_.escapeRegExp(v.key)}\\b`, 'gi');
            if (exp.test(job.description) || exp.test(job.title))
              m.push(v.key);
            return m;
          }, [])
        );
      })
      return Promise.resolve(jobs);
    })
  }

  addRemoteFromContent(jobs) {
    _.each(jobs, job=> {
      job.remote = /(remote|telecommut)/gi.test(job.description); // telecommute, telecommuting
    });
  }
}

let adaptors = _.reduce([
  //'gunio',
  //'remoteok',

  'stackoverflow',
  'github',
  'authenticjobs',
  'weworkremotely',
  'wfh',
  'jobspresso',
  'frontenddevjob',
  'offsite_careers',
  'virtualvocations',
  'hasjob',
  'landing_jobs',
  'jobmote',
  'remotecoder',
  'remoteworkhunt',
  'workingnomads',
], function (m, v, k) {
  m[v] = new (require(`./${v}`))();
  return m;
}, {});

exports.adaptors = adaptors;

exports.refresh = function() {
  // We break down the adaptors.refresh() into steps:
  // 1. Those which scrape tags, so said tags can be provided to those which don't
  // 2. "The rest", basically
  // 3. And also, we kick off any adaptors which are extremely slow in the background, so nothing is waiting on them (not part of the promise chain)
  let seq = _.reduce(adaptors, (m,v)=> {
    m[v.seedsTags ? 'seedsTags' : v.slow ? 'slow' : 'standard'].push(v);
    return m;
  }, {seedsTags:[], slow:[], standard:[]});

  let _refresh = a=>a._refresh();
  return Promise.all(seq.seedsTags.map(_refresh))
    .then(()=> {
      seq.slow.map(_refresh)
      return Promise.all(seq.standard.map(_refresh));
    });
}