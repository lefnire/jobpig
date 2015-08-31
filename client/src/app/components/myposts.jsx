import React from 'react';
import mui from 'material-ui';
import CreateJob from './jobs/create.jsx';
import Job from './jobs/job.jsx';
import _ from 'lodash';
import {request} from '../lib/util';

export default class MyPosts extends React.Component {
  constructor(){
    super();
    this.state = {jobs:[]};
    request.get('/jobs/mine').end((err,res)=>{
      this.setState({jobs: res.body});
    })
  }
  render() {

    return (
      <div>
        <CreateJob ref='createJob'/>

        <mui.FloatingActionButton style={{position:'fixed',bottom:10,right:10}} onTouchTap={()=>this.refs.createJob.show()}>
          <mui.FontIcon className="material-icons">add</mui.FontIcon>
        </mui.FloatingActionButton>

        {this.state.jobs.map((job, i)=> {
          return <div>
            <Job job={job} key={job.id} i={i} />
          </div>
        })}
      </div>
    )
  }
}