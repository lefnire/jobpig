import fetch from 'isomorphic-fetch';

export const REQUEST_JOBS = 'REQUEST_JOBS';
export const RECEIVE_JOBS = 'RECEIVE_JOBS';
export const SET_STATUS = 'SET_STATUS';
//'setEditing',
//'saveNote',

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
    return fetch(`${API_URL}/jobs/${filter}`, {headers:{'x-access-token': window.jwt}})
      .then(response => response.json())
      .then(json => {
        if (_.isEmpty(json) && filter === 'inbox') // poll for new jobs (the server is crunching)
          return window.setTimeout(()=> dispatch(fetchJobs(filter)), 2000);
        dispatch(receiveJobs(filter, json))
      });
  };
}

//setEditing(id){
//  this.setState({editing: id===this.state.editing ? 0 : id});
//}
//
//saveNote({id, note}){
//  request.post(`/jobs/${id}/add-note`).send({note}).end(()=>{});
//  _.merge(_.find(this.state.jobs,{id}), {note}); //fixme
//  this.setState({editing:0});
//}