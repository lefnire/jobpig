'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Jobmote extends Adaptor {
  refresh() {
    return this.fetchFeed('http://jobmote.com/feed.rss').then(results => {
      let feed = results.rss.channel[0].item.slice(0,100);
      let jobs = feed.map(j => {
        let description = j.description[0],
          parts = /^(.*?)\((.*?)\) /.exec(description),
          location = null,
          commitment = null;

        if (parts) { // sometimes it doesn't have "Commitment(Location)"
          commitment = parts[1];
          location = /(anywhere|remote)/gi.test(parts[2]) ? null : parts[2];
        }

        return {
          commitment,
          location,
          description,
          key: j.guid[0],
          source: 'jobmote',
          title: j.title[0],
          company: null,
          url: j.link[0],
          remote: true,
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};