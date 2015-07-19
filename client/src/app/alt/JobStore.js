import alt from './alt';
import JobActions from './JobActions'

class JobStore {
  constructor() {
    this.bindListeners({
      updateJob: JobActions.updateJob
    });

    this.state = {
      jobs: []
    };
  }

  updateJob(job) {
    this.setState({ jobs: this.state.jobs.concat(job) });
  }
}

export default alt.createStore(JobStore, 'JobStore');