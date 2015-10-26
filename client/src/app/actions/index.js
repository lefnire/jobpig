import fetch from 'isomorphic-fetch';

export const REQUEST_JOBS = 'REQUEST_JOBS';
export const RECEIVE_JOBS = 'RECEIVE_JOBS';
export const SET_STATUS = 'SET_STATUS';
export const SET_EDITING = 'SET_EDITING';
export const SAVE_NOTE = 'SAVE_NOTE';

export const API_URL = "<nconf:urls:server>";

// --------- Auth setup ------------

export function login(token) {
  window.localStorage.setItem('jwt', token);
  let d = new Date();
  window.localStorage.setItem('expire', d.setDate(d.getDate() + 30)); // expire token in 30d
  window.location = '/';
}

export function logout() {
  localStorage.clear();
  window.location = '/';
}

// Handle initial "still logged in?" check on page load
let jwt;
(function checkAuth(){
  let expire = window.localStorage.getItem('expire');
  if (expire && expire < new Date)
    logout(); // expired, log out
  jwt = window.localStorage.getItem('jwt');
})();

export function loggedIn(){ return jwt}

export function _fetch(url, opts={}) {
  opts = _.merge({headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}, opts);
  if (jwt) opts.headers['x-access-token'] = jwt;
  if (opts.body) opts.body = JSON.stringify(opts.body);
  return fetch(`${API_URL}/${url}`, opts)
    .then(response=> {
      // If client gets an "unauthorized" response while logged in, log them out.
      if (response.status === 403)
        return logout();
      if (_.inRange(response.status, 200, 300)) {
        // NOTE response.json() fails when there's no body, figure work-around
        return response.json();
      } else {
        return response.json().then(json=> Promise.reject({response, json}));
      }
    })
}

// --------- /Auth setup ------------

function requestJobs(filter) {
  return {
    type: REQUEST_JOBS,
    filter
  };
}

function receiveJobs(filter, json) {
  return {
    type: RECEIVE_JOBS,
    filter: filter,
    jobs: json
  };
}

export function setStatus(id, status) {
  return (dispatch, getState) => {
    return _fetch(`jobs/${id}/${status}`, {method: "POST"})
      .then(json =>
        dispatch(fetchJobs(getState().router.params.filter))
      );
  };
}

export function fetchJobs(filter) {
  return dispatch => {
    dispatch(requestJobs(filter));
    return _fetch(`jobs/${filter}`)
      .then(json => {
        if (_.isEmpty(json) && filter === 'inbox') // poll for new jobs (the server is crunching)
          return window.setTimeout(()=> dispatch(fetchJobs(filter)), 2000);
        dispatch(receiveJobs(filter, json))
      });
  };
}

export function setEditing(id) {
  return {
    type: SET_EDITING,
    id
  }
}

export function saveNote(id, note){
  return dispatch => {
    return fetch(`jobs/${id}/add-note`, {method: "POST", body: {note}})
    .then(json =>
      dispatch({type: SAVE_NOTE, id, note}) // TODO better way to handle this?
    );
  };
}