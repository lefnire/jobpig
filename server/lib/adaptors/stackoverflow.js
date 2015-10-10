'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class StackOverflow extends Adaptor {
  refresh() {
    return this.fetchFeed('http://careers.stackoverflow.com/jobs/feed').then(results=> {
      let feed = results.rss.channel[0].item;
      let jobs = _.map(feed.slice(0,100), item=> {
        return {
          key: item.guid[0]._,
          source: 'stackoverflow',
          title: item.title[0],
          company: item["a10:author"][0]["a10:name"][0],
          url: item.link[0],
          description: item.description[0],
          location: item.location && item.location[0],
          money: null,
          remote: /allows remote/gi.test(item.title[0]),
          tags: item.category
        }
      })
      return Promise.resolve(jobs);
    })
  }
}