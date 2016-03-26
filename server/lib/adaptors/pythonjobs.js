'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class PythonJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('http://www.pythonjobs.com/jobs.atom').then(results => {
      let feed = results.feed.entry.slice(0,100);
      let jobs = feed.map(j => {
        let title = j.title[0],
          location = title.match( /at .*\((.+?)\)$/ )[1],
          remote = false;

        if (/(anywhere|remote)/gi.test(location)) {
          location = null;
          remote = true;
        }

        return {
          title,
          location,
          remote,
          key: j.id[0],
          source: 'pythonjobs',
          url: j.link[0].$.href,
          company: title.match( /at\s*(.+?)\s*\(/ )[1],
          tags: ['Python'],

          // TODO scrape html
          description: j.content[0]._,
        };
      });
      return Promise.resolve({jobs, feed});
    })
  }
}