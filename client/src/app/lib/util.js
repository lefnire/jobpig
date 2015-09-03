import _ from 'lodash';
import defaults from 'superagent-defaults';
import Alt from 'alt';

var alt = new Alt();
var request = defaults();

window.API_URL = 'http://jobseedapp.herokuapp.com';
//window.API_URL = 'http://localhost:3000';

// wake up heroku if it's sleeping
request.get(API_URL).end(()=>{})

var setupHotkeys = function(shortcuts) {
  return _.reduce(shortcuts, (m,v,k)=>{
    let mode = v.enabledWhenEditing ? 'editing' : 'default';
    m[mode].keys[k] = v.k;
    m[mode].handlers[k] = v.fn;
    return m;
  }, {default:{keys:{},handlers:{}}, editing:{keys:{},handlers:{}}});
}

var token = window.sessionStorage.getItem('jwt'); //fixme pollyfill this
if (token)
  request
    .set('x-access-token', token)
    .on('request', function (req) {
      req.url = API_URL+req.url;
    });

export default {setupHotkeys, alt, request};