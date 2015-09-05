import _ from 'lodash';
import defaults from 'superagent-defaults';
import Alt from 'alt';
var alt = new Alt();
var request = defaults();
window.API_URL = "<nconf:urls:server>"; // this gets replaced from gulp-replace based on NODE_ENV. See config.json
window.jwt = null;

// wake up heroku if it's sleeping, we'll need it soon
request.get(API_URL).end(()=>{});

var auth = {
  login(token){
    window.localStorage.setItem('jwt', token);
    var d = new Date();
    window.localStorage.setItem('expire', d.setDate(d.getDate() + 30)); // expire token in 30d
    window.location = '/';
  },
  logout(){
    localStorage.clear();
    window.location = '/';
  }
}

// Handle initial "still logged in?" check on page load
let expire = window.localStorage.getItem('expire');
if (expire && expire < new Date) auth.logout(); // expired, log out
window.jwt = window.localStorage.getItem('jwt');

// If logged in, intercept every request with token header
if (jwt) request.set('x-access-token', jwt).on('request', req=>req.url = API_URL+req.url);

var setupHotkeys = function(shortcuts) {
  return _.reduce(shortcuts, (m,v,k)=>{
    let mode = v.enabledWhenEditing ? 'editing' : 'default';
    m[mode].keys[k] = v.k;
    m[mode].handlers[k] = v.fn;
    return m;
  }, {default:{keys:{},handlers:{}}, editing:{keys:{},handlers:{}}});
}

export default {alt, request, auth, setupHotkeys};
