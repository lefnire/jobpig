'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Hasjob extends Adaptor {
  refresh() {
    return this.fetchFeed('https://hasjob.co/feed').then(results => {
      let feed = results.feed.entry;//.slice(0,100);
      let jobs = feed.map(j => {
        let description = j.content[0]._,
          location = j.location[0],
          remote = false;

        if (/anywhere/gi.test(location)) {
         location = null;
          remote = true;
        }

        return {
          key: j.id[0],
          source: 'hasjob',
          title: j.title[0]._,
          company: /<strong><a.*?>(.*?)<\/a><\/strong><br\/>(.*?)\n/g.exec(description)[1], // [2] previously used for location, now in feed
          url: j.link[0].$.href,
          description,
          location,
          remote,
          tags: []
        }
      })
      return Promise.resolve({jobs, feed});
    })
  }
}