import alt from './alt';

class JobActions {
  updateJob(id, text) {
    return { id, text }
  }
}

export default alt.createActions(JobActions);