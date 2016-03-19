'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class PythonJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('http://www.pythonjobs.com/jobs.atom').then(results => {
      let feed = results.feed.entry;
      let jobs = _.map(feed.slice(0,100), j => {
        let title = j.title[0],
          location = title.match( /\((.+?)\)$/ )[1];
        return {
          key: j.id[0],
          source: 'pythonjobs',
          title: j.title[0],
          url: j.link[0].$.href,
          description: j.content[0]._,
          company: title.match( /at\s*(.+?)\s*\(/ )[1],
          location,
          remote: /anywhere/i.test(location),
          tags: ['python']
        };
      })
      return Promise.resolve(jobs);
    })
  }
}