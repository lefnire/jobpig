'use strict';

var Adaptor = require('./index').Adaptor;
var _ = require('lodash');

module.exports = class Github extends Adaptor {
  list(done) {
    this.fetchFeed('https://jobs.github.com/positions.atom', (err, results) =>{
      var jobs = _.map(results.feed.entry, function(item){
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
      Adaptor.prototype.addTagsFromContent(jobs, (err,jobs)=>{
        Adaptor.prototype.list(done, err, jobs);
      });
    })
  }
  expand(job, done){
    done(null,'<h2>Contents not supported</h2>');
  }
}