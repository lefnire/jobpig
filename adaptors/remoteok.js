'use strict';

var Adaptor = require('./adaptor');
class RemoteOK extends Adaptor {
  list(done) {
    let jobs;
    this.nightmare
      .goto('https://remoteok.io/remote-reactjs-jobs')
      .evaluate(function () {
        return Array.prototype.slice
          .call(document.querySelectorAll('tr.job'))
          .map(function (el) {
            return {
              source: 'remoteok',
              title: el.querySelector('.company h2').innerText,
              company: el.querySelector('.company h3').innerText,
              url: el.querySelector('.company a').getAttribute('href'),
              follow: '', // figure out how to get the link's redirect, use that for id
              description: '',
              location: '',
              budget: '',
              tags: Array.prototype.slice
                .call(el.querySelector('.tags').querySelectorAll('h3'))
                .map(function (tag) {
                  return tag.innerText;
                })
            }
          })
      }, function (_jobs) {
        jobs = _jobs;
      })
      .run(function (err, nightmare) {
        Adaptor.prototype.list(done, err, jobs);
      });
  }
  expand(job, done){
    let deets;
    this.nightmare
      .goto(`https://remoteok.io${job.url}`)
      .evaluate(function(){
        return document.querySelector('.expandContents').innerHTML
      }, function(_deets){
        deets = _deets;
      })
    .run(function(err, nightmare){
        done(err, deets);
      })

  }
}

module.exports = RemoteOK;
