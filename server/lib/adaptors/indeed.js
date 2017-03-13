'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Indeed extends Adaptor {
  refresh() {
    return this.fetchFeed('http://rss.indeed.com/rss').then(results => {
      let feed = results.rss.channel[0].item;//.slice(0,100);
      let jobs = feed.map(j => {
        let parts = j.title[0].split(' - '); // "Job Title (which may have a -) - Company - Location"
        while (parts.length > 3) {
          parts[0] += parts[1];
          parts.splice(1,1);
        }

        let location = parts[2], //also has georss:point available
          remote = false;
        if (/(remote|home|anywhere)/gi.test(location)) {
          location = null;
          remote = true;
        }

        return {
          key: j.guid[0]._,
          source: 'indeed',
          title: j.title[0], // parts[0], // TODO full title until we've validated it parses well
          url: j.link[0],
          description: j.description[0],
          company: parts[1],
          location,
          remote,
          tags: []
        };
      });
      return Promise.resolve({jobs, feed});
    })
  }
};