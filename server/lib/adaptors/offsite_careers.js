'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class OffsiteCareers extends Adaptor {
  constructor(){
    super();
    this.seedsTags = true;
  }
  refresh() {
    return this.fetchFeed('http://offsite.careers/feeds/jobs').then(results=> {
      let jobs = _.map(results.rss.channel[0].item, j=> {
        return {
          key: j.guid[0]._,
          source: 'offsite_careers',
          title: j.title[0],
          company: j['dc:creator'][0],
          url: j.link[0],
          description: j.description[0],
          location: 'Remote',
          money: null,
          remote: true,
          tags: j.category
        }
      })
      return Promise.resolve(jobs);
    })
  }
}