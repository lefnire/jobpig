import React from 'react';
import mui from 'material-ui';
import CreateJob from './create.jsx';
import Job from '../jobs/job.jsx';
import _ from 'lodash';
import {_fetch} from '../../helpers';

export default class Employer extends React.Component {
  constructor(){
    super();
    this.state = {jobs: []};
    _fetch('jobs/mine', {method:"GET"}).then(jobs => {
      this.setState({jobs});
    })
  }

  render() {
    return (
      <div>
        <CreateJob ref='createJob'/>

        <mui.FloatingActionButton style={{position:'fixed',bottom:10,right:10}} onTouchTap={()=>this.refs.createJob.handleOpen()}>
          <mui.FontIcon className="material-icons">add</mui.FontIcon>
        </mui.FloatingActionButton>

        {this.state.jobs.map((job, i) =>
          <div>
            <Job job={job} key={job.id} key={'job-' + i} />
          </div>
        )}
      </div>
    )
  }
}