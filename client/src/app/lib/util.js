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
};

// Handle initial "still logged in?" check on page load
(function checkAuth(){
  let expire = window.localStorage.getItem('expire');
  if (expire && expire < new Date) auth.logout(); // expired, log out
  window.jwt = window.localStorage.getItem('jwt');

  // If logged in, intercept every request with token header
  if (jwt) request.set('x-access-token', jwt).on('request', req=>req.url = API_URL+req.url);
})();

var setupHotkeys = function(shortcuts) {
  return _.reduce(shortcuts, (m,v,k)=>{
    let mode = v.enabledWhenEditing ? 'editing' : 'default';
    m[mode].keys[k] = v.k;
    m[mode].handlers[k] = v.fn;
    return m;
  }, {default:{keys:{},handlers:{}}, editing:{keys:{},handlers:{}}});
};

// Setup google analytics, defer
window.setTimeout(function setupGoogleAnalytics(){
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create','<nconf:ga_tracking_id>', 'auto');
  ga('send', 'pageview');
});

export default {alt, request, auth, setupHotkeys};
