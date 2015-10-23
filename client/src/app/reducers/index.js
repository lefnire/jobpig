import { combineReducers } from 'redux';
import { REQUEST_JOBS, RECEIVE_JOBS } from '../actions';
import { routerStateReducer } from 'redux-router';

function jobs(state = {
  isFetching: false,
  jobs: []
}, action) {
  switch (action.type) {
  case REQUEST_JOBS:
    return Object.assign({}, state, {isFetching: true});
  case RECEIVE_JOBS:
    return Object.assign({}, state, {
      isFetching: false,
      jobs: action.jobs
    });
  default:
    return state;
  }
}

function jobsByFilter(state = { }, action) {
  switch (action.type) {
  case RECEIVE_JOBS:
  case REQUEST_JOBS:
    return Object.assign({}, state, {
      [action.filter]: jobs(state[action.filter], action)
    });
  default:
    return state;
  }
}

const rootReducer = combineReducers({
  jobsByFilter,
  router: routerStateReducer
});

export default rootReducer;