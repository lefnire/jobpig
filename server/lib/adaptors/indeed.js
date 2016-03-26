'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Indeed extends Adaptor {
  refresh() {
    return this.fetchFeed('http://rss.indeed.com/rss').then(results => {
      let feed = results.rss.channel[0].item;
      let jobs = _.map(feed.slice(0,100), j => {
        let parts = j.title[0].split(' - '); // "Job Title (which may have a -) - Company - Location"
        while (parts.length > 3) {
          parts[0] += parts[1];
          parts.splice(1,1);
        }
        return {
          key: j.guid[0]._,
          source: 'indeed',
          title: parts[0],
          url: j.link[0],
          description: j.description[0],

          company: parts[1],
          location: parts[2],
          money: null,
          remote: /remote/i.test(parts[2]),
          tags: []
        };
      })
      return Promise.resolve({jobs, feed});
    })
  }
}