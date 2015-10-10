'use strict';

let Adaptor = require('./index').Adaptor;
let _ = require('lodash');

module.exports = class AuthenticJobs extends Adaptor {
  refresh() {
    return this.fetchFeed('https://authenticjobs.com/rss/custom.php').then(results=> {
      let feed = results.rss.channel["0"].item;
      let jobs = _.map(feed.slice(0,100), item=>{
        let company = /^(.*?)\:/.exec(item.title[0]),
          location = /<strong>\((.*?)\)<\/strong>/i.exec(item.description[0]);
        return {
          key: item.guid[0],
          source: 'authenticjobs',
          title: item.title[0],
          company: company && company[1],
          url: item.link[0],
          description: item.description[0],
          location: location && location[1],
          money: null,
          remote: false,
          tags: []
        }
      })
      Adaptor.prototype.addRemoteFromContent(jobs);
      return Promise.resolve(jobs);
    })
  }
}