'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class AuthenticJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('https://authenticjobs.com/rss/custom.php').then(results => {
      let feed = results.rss.channel["0"].item.slice(0,100);
      let jobs = feed.map(item => {

        let title = item.title[0],
          description = item.description[0],
          location = /<strong>\((.*?)\)<\/strong>/.exec(description)[1],
          remote = false,
          company = null,
          split = title.split(':');

        // Not always "Company: Title", sometimes just "Title"
        if (split.length === 2) {
          company = split[0];
          //title = split[1]; // TODO full title until we've validated it parses well
        }

        if (/(anywhere|remote)/ig.test(location)) {
          remote = true;
          location = null; // just that jobs with "Anywhere" in the location tend to be inconsistent, like "Anywhere (but strong NY preference" which we can't easily parse
        }

        // TODO limit commitment? Options so far are: Full-time, Freelance, All-inclusive, Contract, Internship, Moonlighting

        return {
          description,
          location,
          remote,
          title,
          company,
          source: 'authenticjobs',
          key: item.guid[0],
          url: item.link[0],
          commitment: /^<p>(.*?)<\/p>/.exec(description)[1],
          tags: []
        }
      });
      return Promise.resolve({jobs, feed});
    })
  }
}