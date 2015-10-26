import fetch from 'isomorphic-fetch';

export const REQUEST_JOBS = 'REQUEST_JOBS';
export const RECEIVE_JOBS = 'RECEIVE_JOBS';
export const SET_STATUS = 'SET_STATUS';
export const SET_EDITING = 'SET_EDITING';
export const SAVE_NOTE = 'SAVE_NOTE';

const API_URL = "<nconf:urls:server>";

function headers(){
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-access-token': window.jwt
  };
}

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
    return fetch(`${API_URL}/jobs/${id}/${status}`, {method: "POST", headers: headers()})
      .then( response => dispatch(fetchJobs(getState().router.params.filter)) )
  };
}

export function fetchJobs(filter) {
  return dispatch => {
    dispatch(requestJobs(filter));
    return fetch(`${API_URL}/jobs/${filter}`, {headers: headers()})
      .then(response => response.json())
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
    return fetch(`${API_URL}/jobs/${id}/add-note`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({note})
    })
    .then(response => {
      return dispatch({type: SAVE_NOTE, id, note}); // TODO better way to handle this?
    });
  };
}