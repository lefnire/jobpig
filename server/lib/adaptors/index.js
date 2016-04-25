'use strict';

const _ = require('lodash');
const nightmare = new (require('nightmare'))();
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const request = require('request');
const db = require('../../models');
const Bluebird = require('bluebird');
const nconf = require('nconf');

const fs = require('fs');
const path = require('path');

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
      .then(result => {
        let jobs = result.jobs;

        //TODO strip null values from job? (already handled in bulkCreate?)

        // During tests, dumpt the output so we can make x-validate job-parsing
        if (nconf.get('NODE_ENV') === 'test') {
          fs.writeFileSync(
            path.join(__dirname, 'json_dumps', `${jobs[0].source}.json`),
            JSON.stringify(result.feed.slice(0,100))
          );
        }

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
    return db.Tag.findAll({where: {pending: {$not: true}}, attributes: ['key']}).then(tags=> {
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
  //'frontenddevjob', // FIXME temporarily offline?
  'github',
  //'gunio', // [deleted@7857574] not useful (unfrequented)
  //'hasjob', // mostly low-paying offshore jobs
  'indeed',
  //'ionicjobs', // TODO hydrate
  'jobmote',
  'jobspresso',
  'landing_jobs',
  //'offsite_careers', // dead
  'pythonjobs', // TODO hydrate
  'remotecoder',
  //'remoteok', // [deleted@7857574] not useful (scrapes the same things we do)
  //'remoteworkhunt', // dead
  'virtualvocations', // TODO hydrate
  'weworkremotely',
  'wfh',

  // And the really slow adaptors last
  'workingnomads',
].map( a => new (require('./'+a))() );

exports.adaptors = adaptors;

// On production, adaptors.refresh() maxes resources - so we run serially (Bluebird.each, since no Promise.each).
// We also get UniqueConstraint race conditions if parallel. FIXME when sequelize postgres upsert supported
exports.refresh = () => Bluebird.each(adaptors, adaptor =>
  adaptor._refresh().catch(err => {
    // Don't stop the rest from refreshing when one fails, so pretend all is fine (TODO email admin)
    console.error(err);
    return Promise.resolve();
  })
);