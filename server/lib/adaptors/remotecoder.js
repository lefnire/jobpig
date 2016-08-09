'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Remotecoder extends Adaptor {
  refresh() {
    return this.fetchFeed('http://feedpress.me/remotecoder').then(results => {
      let feed = results.rss.channel[0].item.slice(0,100);
      let jobs = feed.map(j => {

        let description = j.description[0],
          tags = /\n \n#(.*?)\n</.exec(description);
        // TODO regex-parse commitment . Example:
        // `\nFull-time / Permanent / Anywhere\n \n#javascript #html #php #mysql #css #aws\n<img src="http://feedpress.me/8919/2920024.gif" height="1" width="1"/>`

        tags = !tags ? [] : tags[1].split(' ').map(t => t.slice(1));

        return {
          key: j.guid[0],
          source: 'remotecoder',
          title: j.title[0],
          company: null,
          url: j.link[0],
          description,
          location: null,
          remote: true,
          tags
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};