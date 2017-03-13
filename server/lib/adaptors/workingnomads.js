'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Workingnomads extends Adaptor {
  refresh() {
    return this.fetchFeed('http://www.workingnomads.co/jobs/feed/all.atom').then(results => {
      let feed = results.feed.entry;//.slice(0,100);
      let jobs = feed.map(j => {
        return {
          key: j.id[0],
          source: 'workingnomads',
          title: j.title[0],
          company: j.author[0].name[0],
          url: j.link[0].$.href,
          description: j.content[0],
          location: null,
          remote: true,
          tags: j.category
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};