import alt from './alt';

class JobActions {
  constructor() {
    this.generateActions(
      'fetch',
      'setEditing',
      'saveNote',
      'setStatus'
    )
  }
}

export default alt.createActions(JobActions);