'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class WFH extends Adaptor {
  refresh() {
    return this.fetchFeed('https://www.wfh.io/jobs.atom').then(results => {
      let feed = results.feed.entry.slice(0,100);
      let jobs = feed.map(item => {
        return {
          key: item.id[0],
          source: 'wfh',
          title: item.title[0],
          company: null,
          url: item.link[0].$.href,
          description: item.content[0]._,
          location: null,
          remote: true,
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};