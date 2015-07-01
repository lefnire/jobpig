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
              title: el.querySelector('.company h2').innerText,
              company: el.querySelector('.company h3').innerText,
              url: el.querySelector('.company a').getAttribute('href'),
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
}

module.exports = RemoteOK;
