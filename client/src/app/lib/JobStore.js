import {alt, request} from './util';
import JobActions from './JobActions'
import _ from 'lodash';

export default alt.createStore(class JobStore {
  // see https://github.com/goatslacker/alt/tree/master/examples/todomvc
  constructor() {
    this.bindActions(JobActions);
    this.state = {
      jobs:[],
      editing:0 // 0 when off, job.id when editing something
    };
  }

  fetch(){
    var filter = /jobs\/(.*)/.exec(window.location.hash)[1]; //fixme handle this in app.jsx through react-router
    request.get(`/jobs/${filter}`).end((err,res)=> {
      if (_.isEmpty(res.body) && filter=='inbox') { // poll for new jobs (the server is crunching)
        window.setTimeout(()=>this.fetch(), 1000);
      }
      this.setState({jobs: res.body})
    })
  }

  setStatus({id,status}){
    request.post(`/jobs/${id}/${status}`).end((err,res)=>this.fetch());
  }

  setEditing(id){
    this.setState({editing: id==this.state.editing ? 0 : id});
  }

  saveNote({id, note}){
    request.post(`/jobs/${id}/add-note`).send({note}).end(()=>{});
    _.merge(_.find(this.state.jobs,{id}), {note}); //fixme
    this.setState({editing:0});
  }
})