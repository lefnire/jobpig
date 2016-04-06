const _ = require('lodash');

// normalize tag keys, for uniqueness
exports.textToKey = text => {
  return text
    .trim().toLowerCase() // sanitize
    .replace(/[_\. ](?=js)/g, '') // node.js, node_js, node js => nodejs
    .replace(/\.(?!net)/g, '') // replace all periods, except .net, asp.net, etc
    .replace(/(\s+|\-)/g, '_') // space/- => _
    .replace(/[^a-zA-Z0-9#\+\._]/g, '') // remove punctuation, except language chars (c++, c#, TODO what else?)
  //.replace(/_+/g,'_') // for any consecutive _s (eg "NY, NY" = NY__NY): squash to one _
};