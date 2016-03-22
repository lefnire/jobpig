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
              <h1 style={{paddingBottom:10, borderBottom: '1px solid #eee'}}>Employers, post a job here!</h1>
              <ul style={{padding:20, margin: 40, fontSize:"1.2em"}}>
                <li>You can post a job by clicking the + button in the bottom right corner.</li>
                <li>Return to this section after posting your job to see:</li>
                    <ul>
                        <li>Statistics on you job posting.</li>
                        <li>Prospective candidates for your job.</li>
                        <li>Links to see your prospective canadates profile.</li>
                        <li>Messaging system to recieve and send email to prospective canadates.</li>
                        <li>Your job posts.</li>
                    </ul>
                    
                <li>Jobs posted through Jobpig will have special features that other postings will not have:</li>
                  <ul>
                    <li>Jobs will automatically show up first for searchers.</li>
                    <li>Jobs will have a "CONTACT EMPLOYER" button.</li>
                    <li>Jobs will have bold coloring to ensure that your job stands out to canadates.</li>
                    </ul>
                  <li>Posting a job costs $100 for 30 days. Sign up today and find a perfect employee match for your company!</li>
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
