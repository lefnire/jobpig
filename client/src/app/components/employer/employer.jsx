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
    let isEmpty = this.state.jobs.length === 0;

    return (
      <div>
        <CreateJob ref={c => global.jobpig.createJob = c} onCreate={this._fetchMine} />

        {isEmpty ?
          <mui.Card style={{margin:40}}>
            <mui.CardText>
              <h1 style={{paddingBottom:10, borderBottom: '1px solid #eee'}}>Employers, post jobs here!</h1>
              <ul style={{padding:20, margin: 40, fontSize:"1.2em"}}>
                <li>Post a job ($100 for 30 days): click "Post Job" in the top right corner.</li>
                {/*<li>Statistics on you job posting.</li>*/}
                <li>View & contact prospective candidates for your job, sorted by match.</li>
                <li>Your job will have higher view priority for searchers. Searchers may additionally contact you through Jobpig</li>
                {/*<li>Jobs will have bold coloring to ensure that your job stands out to candidates.</li>*/}
              </ul>

            </mui.CardText>
          </mui.Card>
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
