import fetch from 'isomorphic-fetch';

global.jobpig = {
  env: "<nconf:NODE_ENV>"
};

const isProd = jobpig.env === 'production';

// Maybe put this file in a common/ dir?
exports.constants = require('../../../server/lib/constants');
const {TAG_TYPES, AUTH_ACTIONS} = exports.constants;

export const API_URL = "<nconf:urls:server>";

export function login(token, action) {
  window.localStorage.setItem('jwt', token);
  let d = new Date();
  window.localStorage.setItem('expire', d.setDate(d.getDate() + 30)); // expire token in 30d
  //jwt = token;

  window.location = {
    [AUTH_ACTIONS.POST_JOB]: '/?flash=POST_JOB&redirect=/#/employer',
    //[AUTH_ACTIONS.REGISTER]: '/?flash=FILL_PROFILE&redirect=/#/profile'
  }[action] || '/';
}

export function logout() {
  localStorage.clear();
  window.location = '/';
}

// Handle initial "still logged in?" check on page load
let jwt;
let expire = window.localStorage.getItem('expire');
if (expire && expire < new Date)
  logout(); // expired, log out
jwt = window.localStorage.getItem('jwt');

export function loggedIn(){ return !!jwt }

export function _fetch(url, opts={}) {
  opts = _.merge({headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}, opts);
  if (jwt) opts.headers['x-access-token'] = jwt;
  if (opts.body) opts.body = JSON.stringify(opts.body);
  return fetch(`${API_URL}/${url}`, opts)
    .then(response => {
      // If client gets an "unauthorized" response while logged in, log them out.
      if (response.status === 403 && jwt)
        return logout();
      if (_.inRange(response.status, 200, 300)) {
        // NOTE response.json() fails when there's no body, figure work-around
        return response.json();
      } else {
        return response.json().then(json => Promise.reject({response, json}));
      }
    });
}

let user;
export function me() {
  if (user) return Promise.resolve(user);
  return _fetch('user').then(user => {
    user = user;
    return Promise.resolve(user);
  });
}

let tags = {};
export function getTags(type=TAG_TYPES.SKILL) {
  return new Promise((resolve, reject) => {
    if (tags[type]) return resolve(tags[type]);
    _fetch('jobs/tags/' + type).then(_tags => {
      tags[type] = _tags.map(t => ({value: t.id, label: t.text}));
      resolve(tags[type]);
    }).catch(reject);
  });
};

export const filterOptions = (allowCreate, text='Add') => (options, filter, currentValues) => {
  if (!filter) return [];
  return _(options)
    .filter(o => ~o.label.toLowerCase().indexOf(filter.toLowerCase()))
    .difference(currentValues)
    .concat(
      !allowCreate ? []
      : _.some(currentValues, {label: filter}) ? []
      : [{label: `${text} ${filter}`, value: filter, create: true}]
    ).slice(0,50)
    .value();
};

// Setup google analytics, defer
export const setupGoogle = () => {
  if (!isProd)
    return window.ga = _.noop;
  _.defer(() => {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create','<nconf:ga_tracking_id>', 'auto');
    ga('send', 'pageview');
  });
};

export const _ga = {
  event: () => isProd && ga && ga.apply(null, ['send', 'event'].concat(arguments))
};