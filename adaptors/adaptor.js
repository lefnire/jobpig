'use strict';

var _ = require('lodash');
var Nightmare = require('nightmare');

class Adaptor {
  constructor(){
    this.nightmare = new Nightmare();
  }
  list(done, err, jobs){
    _.each(jobs, function(job){
      // job ids in database are alphanumeric URLs (in case of repeats from other websites)
      job.id = job.url.replace(/\W+/g, "");
    })
    console.log('Done');
    done(err, jobs);
  }
}

module.exports = Adaptor;