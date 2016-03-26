'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class LandingJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('https://landing.jobs/feed').then(results => {
      let feed = results.feed.entry;
      let jobs = _.map(feed.slice(0,100), j => ({
        key: j.id[0],
        source: 'landing_jobs',
        title: j.title[0],
        company: j.author[0].name[0],
        url: j.link[0].$.href,
        description: j.content[0]._,
        location: null,
        money: null,
        remote: /remote/gi.test(j.content[0]._),
        tags: []
      }));
      return Promise.resolve({jobs, feed});
    })
  }
}