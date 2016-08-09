'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Github extends Adaptor {
  refresh() {
    return this.fetchFeed('https://jobs.github.com/positions.atom').then(results => {
      let feed = results.feed.entry.slice(0,100);
      let jobs = feed.map(item => {
        let title = item.title[0], // /: (.*?) at /.exec(title)[1] // TODO full title until we've validated it parses well
          commitment = /^(.*?):/.exec(title)[1].replace(' ', '-'), // "Full Time" => "Full-Time"
          location = / in (.*)$/gi.exec(title)[1], //"Rails at Github in SF/Remote"
          remote = false;

        if (/(remote|anywhere)/gi.test(location)) {
          location = null;
          remote = true;
        }

        return {
          title,
          commitment,
          remote,
          location,

          key: item.id[0],
          source: 'github',
          company: / at (.*) in /gi.exec(title)[1], // "Rails at Github in SF/Remote", use Github
          url: item.link[0].$.href,
          description: item.content[0]._,
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    });
  }
}