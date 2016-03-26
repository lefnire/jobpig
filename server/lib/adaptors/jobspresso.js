'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Jobspresso extends Adaptor {
  refresh() {
    return this.fetchFeed('https://jobspresso.co/?feed=job_feed').then(results=>{
      let feed = results.rss.channel[0].item;
      let jobs = _.map(feed.slice(0,100), item=> {
        let location = item['job_listing:location'] ? item['job_listing:location'][0] : 'Anywhere';
        return {
          key: item.guid[0]._,
          source: 'jobspresso',
          title: item.title[0],
          company: item['job_listing:company'][0],
          url: item.link[0],
          description: item.description[0],
          location: location,
          money: null,
          remote: /anywhere/gi.test(location),
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
}