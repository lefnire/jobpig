'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Remoteworkhunt extends Adaptor {
  refresh() {
    return this.fetchFeed('http://www.remoteworkhunt.com/feed').then(results => {
      let feed = results.rss.channel[0].item.slice(0,100);
      let jobs = feed.map(j => {
        return {
          key: j.guid[0]._,
          source: 'remoteworkhunt',
          title: j.title[0],
          company: j.category[0],
          url: j.link[0],
          description: j.description[0],
          location: 'Remote',
          money: null,
          remote: true,
          tags: j.category.slice(1)
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
}