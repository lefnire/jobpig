'use strict';

let _ = require('lodash');
let nightmare = new (require('nightmare'))();
let xml2js = require('xml2js');
let parser = new xml2js.Parser();
let request = require('request');
let db = require('../../models/models');
let Bluebird = require('sequelize/node_modules/bluebird');

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

let adaptors = [
  //'gunio',
  //'remoteok',

  // Process those which seed tags first
  'stackoverflow',
  'remoteworkhunt',
  'offsite_careers',

  // Then the rest
  'github',
  'authenticjobs',
  'weworkremotely',
  'wfh',
  'jobspresso',
  'frontenddevjob',
  'virtualvocations',
  'hasjob',
  'landing_jobs',
  'jobmote',
  'remotecoder',

  // And the really slow adaptors last
  'workingnomads',
].map( a=> new (require('./'+a))() );

exports.adaptors = adaptors;

// Process adaptors.refresh() serially, as loading them all into memory crashes heroku. Slow, I know, but whatevs
exports.refresh = () =>
  Bluebird.each(adaptors, a=>a._refresh())