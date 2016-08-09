'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class LandingJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('https://landing.jobs/feed').then(results => {
      let feed = results.feed.entry.slice(0,100);
      let jobs = feed.map(j => {
        let description = j.content[0]._,
          parts = />At (.*?) \((.*?)\), in (.*?)</.exec(description),
          company = parts[1],
          commitment = parts[2],
          location = parts[3];

        return {
          company,
          commitment,
          location,
          description,
          key: j.id[0],
          source: 'landing_jobs',
          url: j.link[0].$.href,
          title: j.title[0],
          remote: false, //FIXME // /remote/gi.test(j.content[0]._),
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};