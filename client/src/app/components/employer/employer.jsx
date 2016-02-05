import React from 'react';
import mui from 'material-ui';
import CreateJob from './create.jsx';
import Job from '../jobs/job.jsx';
import _ from 'lodash';
import {_fetch} from '../../actions';

//FIXME switch to redux

export default class Employer extends React.Component {
  constructor(){
    super();
    this.state = {jobs:[]};
    _fetch('jobs/mine', {method:"GET"}).then(body => {
      this.setState({jobs: body});
    })
  }

  render() {
    return (
      <div>
        <CreateJob ref='createJob'/>

        <mui.FloatingActionButton style={{position:'fixed',bottom:10,right:10}} onTouchTap={()=>this.refs.createJob.handleOpen()}>
          <mui.FontIcon className="material-icons">add</mui.FontIcon>
        </mui.FloatingActionButton>

        {this.state.jobs.map((job, i) => {
          return <div>
            <Job job={job} key={job.id} i={i} />
          </div>
        })}
      </div>
    )
  }
}