var Nightmare = require('nightmare');
var nightmare = new Nightmare();
var nconf = require('nconf');

function list (done) {
  var jobs;
  nightmare
    .goto('https://gun.io/accounts/signin/')
    .type('#id_identification', nconf.get('gunio:username'))
    .type('#id_password', nconf.get('gunio:password'))
    .click('input[value="Sign in"]')
    .wait()
    .evaluate(function(){
      var t = function(el, binding){
        return el.querySelector('[data-bind="text: '+binding+'"]').innerText
      }
      return Array.prototype.slice
        .call(document.querySelectorAll('#contractjobs_container .row.bs-docs'))
        .map(function(el){
          var id = el.querySelector('[data-bind="attr: { class: \'jobbody\' + id }"]').className.replace('jobbody','');
          return {
            id: id,
            title: t(el,'title'),
            company: t(el,'company_name'),
            url: 'https://gun.io/dash3/gig/' + id,
            description: t(el,'blurb'),
            location: t(el,'city') + ',' + t(el,'state'),
            budget: el.querySelector('h2.variable span').innerText,
            tags: Array.prototype.slice
              .call(el.querySelector('[data-bind="html: tagify(tags)"]').querySelectorAll('a'))
              .map(function(tag){
              return tag.innerText;
            })
          }
        })
    }, function(_jobs){
      jobs = _jobs;
    })
    .run(function(err, nightmare){
      done(err, jobs);
    });
}

module.exports = list;
