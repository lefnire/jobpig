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
    let styles = {
      button: {
        position:'fixed',
        bottom:10,
        right:10
      }
    }

    let isEmpty = this.state.jobs.length === 0;

    return (
      <div>
        <CreateJob ref='createJob' onCreate={this._fetchMine} />

        <mui.FloatingActionButton style={styles.button} onTouchTap={() => this.refs.createJob.handleOpen()}>
          <mui.FontIcon className="material-icons">add</mui.FontIcon>
        </mui.FloatingActionButton>

        {isEmpty ?
          <div>
            <h1>Post a job!</h1>
            <p>You can post a job by clicking the + button in the bottom right. Jobs cost $100/30d. Return to this
              section after posting your job to see visitor stats, prospective candidates, etc.</p>
          </div>
          :
          this.state.jobs.map((job, i) =>
            <div>
              <Job job={job} key={job.id} key={'job-' + i}/>
            </div>
          )
        }
      </div>
    )
  }

  _fetchMine = () => {
    _fetch('jobs/mine', {method: "GET"}).then(jobs => this.setState({jobs}));
  }
}