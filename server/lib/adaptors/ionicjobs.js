'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class IonicJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('http://jobs.ionic.io/rss').then(results => {
      let feed = results.rss.channel[0].item;
      let jobs = feed.map(j => {
        let title = j.title[0],
          company = title.match(/^(.+?):/)[1];
        return {
          url: j.link[0],
          key: j.link[0],
          source: 'ionicjobs',
          title,
          company,

          // TODO scrape html
          description: '',
          location: '',
          remote: false,
          tags: ['Ionic']
        };
      });
      return Promise.resolve(jobs);
    })
  }
}