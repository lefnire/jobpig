'use strict';

var Adaptor = require('./adaptor');
var _ = require('lodash');

module.exports = class AuthenticJobs extends Adaptor {
  list(done) {
    this.fetchFeed('https://authenticjobs.com/rss/custom.php', (err, results)=>{
      var jobs = _.map(results.rss.channel["0"].item, function(item){
        return {
          key: item.guid[0],
          source: 'authenticjobs',
          title: item.title[0],
          company: /^(.*)\:/.exec(item.title[0])[1],
          url: item.link[0],
          description: item.description[0],
          location: /<strong>\((.*)\)<\/strong>/gi.exec(item.description[0])[1],
          money: null,
          remote: false,
          tags: []
        }
      })
      Adaptor.addRemoteFromContent(jobs);
      Adaptor.addTagsFromContent(jobs, ()=>{
        Adaptor.prototype.list(done, err, jobs);
      })
    })
  }
  expand(job, done){
    done(null,'<h2>Contents not supported</h2>');
  }
}