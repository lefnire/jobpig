'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Jobspresso extends Adaptor {
  refresh() {
    return this.fetchFeed('https://jobspresso.co/?feed=job_feed').then(results => {
      let feed = results.rss.channel[0].item.slice(0,100);
      let jobs = feed.map(item => {
        let location = item['job_listing:location'] ? item['job_listing:location'][0] : 'Anywhere',
          remote = false;
        if (/anywhere/gi.test(location)) {
          location = null;
          remote = true;
        }
        return {
          key: item.guid[0]._,
          source: 'jobspresso',
          title: item.title[0],
          company: item['job_listing:company'][0],
          url: item.link[0],
          description: item['content:encoded'][0], //item.description[0],
          location,
          remote,
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
};