import { combineReducers } from 'redux';
import { REQUEST_JOBS, RECEIVE_JOBS, SET_EDITING, SAVE_NOTE } from '../actions';
import { routerStateReducer } from 'redux-router';
import update from 'react-addons-update';

function handleEditing(state, action) {
  switch (action.type) {
  case SET_EDITING:
    return update(state, {
      editing: {$set: action.id === state.editing ? 0 : action.id}
    });
  case SAVE_NOTE:
    let i = _.findIndex(state.jobs, {id:action.id});
    let ret= update(state, {
      jobs: {[i]: {note: {$set: action.note}}},
      editing: {$set: 0}
    });
    return ret;
  default:
    return state;
  }
}

function handleFetching(state, action) {
  switch (action.type) {
  case REQUEST_JOBS:
    return update(state, {isFetching: {$set: true}});
  case RECEIVE_JOBS:
    return update(state, {$merge: {
      isFetching: false,
      jobs: action.jobs,
      editing: 0
    }});
  default:
    return state;
  }
}

function jobs(state = {isFetching: false, jobs: [], editing: 0}, action) {
  switch (action.type) {
  case RECEIVE_JOBS:
  case REQUEST_JOBS:
    return handleFetching(state, action);
  case SET_EDITING:
  case SAVE_NOTE:
    return handleEditing(state, action);
  default:
    return state;
  }
}

const rootReducer = combineReducers({
  jobs,
  router: routerStateReducer,
});

export default rootReducer;