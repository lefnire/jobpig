'use strict';

const _ = require('lodash');
const nightmare = new (require('nightmare'))();
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const request = require('request');
const db = require('../../models/models');
const Bluebird = require('bluebird');
const nconf = require('nconf');

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
  //'remoteworkhunt', // dead
  //'offsite_careers', // dead

  // Then the rest
  'indeed',
  'github',
  'authenticjobs',
  'weworkremotely',
  'wfh',
  'jobspresso',
  'frontenddevjob',
  'virtualvocations',
  'hasjob',
  'landing_jobs',
  //'jobmote',
  'remotecoder',

  // And the really slow adaptors last
  'workingnomads',
].map( a => new (require('./'+a))() );

exports.adaptors = adaptors;

// On production, adaptors.refresh() maxes resources - so we run serially. Speed things up on dev/test
exports.refresh = () =>
  nconf.get('NODE_ENV') === 'production'
    ? Bluebird.each(adaptors, a => a._refresh())
    : Promise.all(adaptors.map(a => a._refresh()));