'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Hasjob extends Adaptor {
  refresh() {
    return this.fetchFeed('https://hasjob.co/feed').then(results=> {
      let jobs = _.map(results.feed.entry, j=> {
        let exp = /<strong><a.*?>(.*?)<\/a><\/strong><br\/>(.*?)\n/g.exec(j.content[0]._);
        return {
          key: j.id[0],
          source: 'hasjob',
          title: j.title[0]._,
          company: exp[1],
          url: j.link[0].$.href,
          description: j.content[0]._,
          location: exp[2],
          money: null,
          remote: /anywhere/gi.test(exp[2]),
          tags: []
        }
      })
      return Promise.resolve(jobs);
    })
  }
}