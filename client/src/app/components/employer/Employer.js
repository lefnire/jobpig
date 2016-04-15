import React from 'react';
import {
  RaisedButton
} from 'material-ui';
import CreateJob from './Create';
import Job from '../jobs/Job';
import _ from 'lodash';
import {_fetch, constants, me} from '../../helpers';
const {TAG_TYPES} = constants;

export default class Employer extends React.Component {
  constructor(){
    super();
    this.state = {jobs: []};
    this._refresh();
  }

  renderJobs = () => {
    return this.state.jobs.map((job, i) => (
      <Job job={job} key={job.id} isEmployer={true} />
    ));
  };

  renderEmpty = () => {
    let {free_jobs} = this.state;

    let fakeJob = {
      title: 'Your Job Title',
      //description: `Post your job here. Users will find you if their preferences match your job's attributes; and vice versa. $50 for 30days, and your post will be promoted to matching users!`,
      //description: `Seeking Full-time JavaScript and Ruby on Rails developer to join our awesome San Francisco office!`,
      views: 25,
      likes: 10,
      dislikes: 5,
      tags: [
        {text: "Your Company", type: TAG_TYPES.COMPANY},
        {text: "San Francisco, CA", type: TAG_TYPES.LOCATION},
        {text: "Full-time", type: TAG_TYPES.COMMITMENT},
        {text: "Ruby on Rails"},
        {text: "JavaScript"},
        {text: "PostgreSQL"}
      ].map((t,key) => _.assign({key, type: TAG_TYPES.SKILL}, t)),
      users: [{
        id: 1,
        fullname: 'Tyler Renelle',
        score: 10,
        tags: [{key: 'PostgreSQL'},{key: 'JavaScript'},{key: 'Full-time'}],
        pic: 'http://www.gravatar.com/avatar/ff2dd194f7faa850a0410f93735280b8',
        bio: `Full Stack JavaScript developer, 10 years in web & mobile. Focused on Node, React / React Native, and Angular / Ionic. Creator of HabitRPG, a startup begun on Kickstarter which now has 800k+ users. Built an enterprise PDF-creation service employed by 1.5k sites, and websites for clients such as Adidas, BigFix, and UCSF. Currently obsessed with machine learning - bonafide singularitarian here.`
      }]
    }

    return (
      <div className="padded">
        <div className="empty-text">
          <h2>
            Post a Job&nbsp;
            <span style={{textDecoration: free_jobs ? 'line-through' : ''}}>($99 for 30 days)</span>&nbsp;
            {free_jobs? <b>{free_jobs} Free Post{free_jobs>1? 's': ''}!</b> : null}
          </h2>

          <ul>
            <li>View / contact candidates who match your listing, sorted by score</li>
            <li>Higher listing display priority for searchers</li>
            <li>Listing analytics</li>
            {/*<li>Jobs will have bold coloring to ensure that your job stands out to candidates.</li>*/}
          </ul>
          <RaisedButton label="Post Job" primary={true} onTouchTap={()=> global.jobpig.createJob.open()} />
        </div>
        <br/>
        <Job job={fakeJob} style={{opacity:0.5}} isEmployer={true} />
      </div>
    );
  };

  render() {
    let isEmpty = this.state.jobs.length === 0;

    return (
      <div>
        <CreateJob ref={c => global.jobpig.createJob = c} onCreate={this._refresh} free_jobs={this.state.free_jobs} />
        {isEmpty? this.renderEmpty() : this.renderJobs()}
      </div>
    )
  }

  _refresh = () => {
    Promise.all([
      _fetch('jobs/mine', {method: "GET"}),
      me()
    ]).then(vals => this.setState({
      jobs: vals[0],
      free_jobs: vals[1].free_jobs
    }));
  }
}
