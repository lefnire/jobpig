import fetch from 'isomorphic-fetch';

export const API_URL = "<nconf:urls:server>";

export function login(token) {
  window.localStorage.setItem('jwt', token);
  let d = new Date();
  window.localStorage.setItem('expire', d.setDate(d.getDate() + 30)); // expire token in 30d

  // if this was registration, or no profile-data
  // then window.location = '/#/profile';
  window.location = '/';
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
      if (response.status === 403)
        return logout();
      if (_.inRange(response.status, 200, 300)) {
        // NOTE response.json() fails when there's no body, figure work-around
        return response.json();
      } else {
        return response.json().then(json => Promise.reject({response, json}));
      }
    })
}

let user;
export function me() {
  if (user) return Promise.resolve(user);
  return _fetch('user').then(user => {
    user = user;
    return Promise.resolve(user);
  });
}

let tags;
export function getTags() {
  return new Promise((resolve, reject) => {
  if (tags) return resolve(tags);
  _fetch('jobs/tags').then(_tags => {
      tags = _tags.map(t => {return {value: t.id, label: t.key}});
      resolve(tags);
    }).catch(reject);
  })
}