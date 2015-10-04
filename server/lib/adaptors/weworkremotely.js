'use strict';

var Adaptor = require('./index').Adaptor;
var _ = require('lodash');

module.exports = class WeWorkRemotely extends Adaptor {
  constructor(){
    super();
    this.seedsTags = false;
  }
  refresh() {
    return this.fetchFeed('https://weworkremotely.com/jobs.rss').then(results=>{
      var jobs = _.map(results.rss.channel["0"].item, function(item){
        return {
          key: item.guid[0],
          source: 'weworkremotely',
          title: item.title[0],
          company: /^(.*?)\:/gi.exec(item.title[0])[1],
          url: item.link[0],
          description: item.description[0],
          location: 'Remote',
          money: null,
          remote: true,
          tags: []
        }
      })
      return Adaptor.prototype.refresh(jobs);
    })
  }
  expand(job, done){
    done(null,'<h2>Contents not supported</h2>');
  }
}