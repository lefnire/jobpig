'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class WeWorkRemotely extends Adaptor {
  refresh() {
    return this.fetchFeed('https://weworkremotely.com/jobs.rss').then(results => {
      let feed = results.rss.channel["0"].item.slice(0,100);
      let jobs = feed.map(item => {
        let title = item.title[0];
        //TODO regex location from description
        return {
          title,
          key: item.guid[0],
          source: 'weworkremotely',
          company: /^(.*?)\:/.exec(title)[1],
          url: item.link[0],
          description: item.description[0],
          location: null,
          remote: true,
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};