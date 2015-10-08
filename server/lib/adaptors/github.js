'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Github extends Adaptor {
  refresh() {
    return this.fetchFeed('https://jobs.github.com/positions.atom').then(results=> {
      let jobs = _.map(results.feed.entry, item=> {
        return {
          key: item.id[0],
          source: 'github',
          title: item.title[0],
          company: /at (.*) in/gi.exec(item.title[0])[1], // "Rails at Github in SF/Remote", use Github
          url: item.link[0].$.href,
          description: item.content[0]._,
          location: / in (.*)/gi.exec(item.title[0])[1], //"Rails at Github in SF/Remote"
          remote: /(remote|anywhere)/gi.test(item.title[0]), //"Rails at Github in SF/Remote"
          money: null,
          tags: [] // parsed below
        }
      })
      return Promise.resolve(jobs);
    })
  }
}