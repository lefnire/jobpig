'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Frontenddevjob extends Adaptor {
  refresh() {
    return this.fetchFeed('https://zapier.com/engine/rss/242783/frontenddevjob').then(results=> {
      let feed = results.rss.channel[0].item;//.slice(0,100);
      let jobs = feed.map(j => {

        let title = j.title[0], //title = /^.*?\s(.*?) at/.exec(title)[1] //TODO full title until we've validated it parses well
          commitment = /^(.*?)\s/.exec(title)[1],
          company = / at (.*?) (on site|remote)/.exec(j.title[0])[1],
          location = null,
          remote = false;

        if (/remote/gi.test(title)) {
          remote = true;
        } else {
          location = /on site (.*)/.exec(title)[1];
        }

        return {
          title,
          company,
          location,
          remote,
          commitment,
          key: j.guid[0]._,
          source: 'frontenddevjob',
          url: j.link[0],
          description: j.description[0],
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
}