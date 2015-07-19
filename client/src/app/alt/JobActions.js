import alt from './alt';

class JobActions {
  constructor() {
    this.generateActions(
      'list',
      'setEditing',
      'saveNote',
      'setStatus'
    )
  }
}

export default alt.createActions(JobActions);