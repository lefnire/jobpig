'use strict';

let request = require("request");
let cheerio = require("cheerio");
let Adaptor = require('./index').Adaptor;

module.exports = class RemoteOK extends Adaptor {
  refresh() {
    return new Promise(resolve=> {
      request('https://remoteok.io', (err, response, html)=> {
        let $ = cheerio.load(html);
        let jobs = $('tr.job').map(function(){
          let el = $(this);
          return {
            source: 'remoteok',
            title: el.find('.company_and_position h2').text(),
            company: el.find('.company_and_position.company h3').text(),
            //url: 'https://remoteok.io' + el.find('.company a').attr('href'),
            url: 'https://remoteok.io' + el.find('td.source a').attr('href'),
            follow: '', // figure out how to get the link's redirect, use that for id
            description: '',
            location: '',
            money: '',
            remote: true,
            tags: el.find('.tags').find('h3').map(function() {
              return $(this).text();
            }).toArray()
          }
        }).toArray();
        resolve(jobs);
      })
    })
  }
}