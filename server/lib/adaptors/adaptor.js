'use strict';

var _ = require('lodash');
var nightmare = new (require('nightmare'))();

class Adaptor {
  constructor() {
    this.nightmare = nightmare;
  }
  list(done, err, jobs){
    _.each(jobs, function(job){
      // job ids in database are alphanumeric URLs (in case of repeats from other websites)
      job.key = job.url.replace(/\W+/g, "");
    })
    console.log(`${jobs[0].source} done`);
    done(err, jobs);
  }
}

module.exports = Adaptor;