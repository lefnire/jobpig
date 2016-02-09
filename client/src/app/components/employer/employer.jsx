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
    this._fetchMine();
  }

  render() {
    return (
      <div>
        <CreateJob ref='createJob' onCreate={this._fetchMine}/>

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

  _fetchMine = () => {
    _fetch('jobs/mine', {method: "GET"}).then(jobs => this.setState({jobs}));
  }
}