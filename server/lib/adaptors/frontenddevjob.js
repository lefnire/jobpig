'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class Frontenddevjob extends Adaptor {
  refresh() {
    return this.fetchFeed('https://zapier.com/engine/rss/242783/frontenddevjob').then(results=> {
      let jobs = _.map(results.rss.channel[0].item, j=> {

        let company = /at (.*?) (on site|remote)/.exec(j.title[0]);
          company = company && company[1];
        let location = /on site (.*)/.exec(j.title[0]);
          location = location && location[1];

        return {
          key: j.guid[0],
          source: 'frontenddevjob',
          title: j.title[0],
          company,
          url: j.link[0],
          description: j.description[0],
          location,
          money: null,
          remote: /remote/gi.test(j.title[0]),
          tags: []
        }
      })
      return Promise.resolve(jobs);
    })
  }
}