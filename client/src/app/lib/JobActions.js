import alt from './alt';

class JobActions {
  constructor() {
    this.generateActions(
      'list',
      'setEditing',
      'saveNote',
      'setStatus',
      'refresh'
    )
  }
}

export default alt.createActions(JobActions);