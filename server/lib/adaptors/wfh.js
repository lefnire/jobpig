'use strict';

var Adaptor = require('./index').Adaptor;
var _ = require('lodash');

module.exports = class WFH extends Adaptor {
  refresh() {
    return this.fetchFeed('https://www.wfh.io/jobs.atom').then(results=>{
      var jobs = _.map(results.feed.entry, function(item){
        return {
          key: item.id[0],
          source: 'wfh',
          title: item.title[0],
          company: 'Unknown',
          url: item.link[0].$.href,
          description: item.content[0]._,
          location: 'Remote',
          money: null,
          remote: true,
          tags: []
        }
      })
      return Adaptor.prototype.refresh(jobs);
    })
  }
}