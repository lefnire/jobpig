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
      .then(db.Job.bulkCreateWithTags);
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
  // Process those which seed tags first
  'stackoverflow',

  // Then the rest
  'authenticjobs',
  'frontenddevjob',
  'github',
  //'gunio', // not useful
  'hasjob',
  'indeed',
  'ionicjobs',
  'jobmote', // dead
  'jobspresso',
  'landing_jobs',
  //'offsite_careers', // dead
  'pythonjobs',
  'remotecoder',
  //'remoteok', // not useful (scrapes the same things we do)
  //'remoteworkhunt', // dead
  'virtualvocations',
  'weworkremotely',
  'wfh',

  // And the really slow adaptors last
  'workingnomads',
].map( a => new (require('./'+a))() );

exports.adaptors = adaptors;

// On production, adaptors.refresh() maxes resources - so we run serially. Also, we get UniqueConstraint
// race conditions if parallel. FIXME when sequelize postgres upsert supported
exports.refresh = () => Bluebird.each(adaptors, a => a._refresh());