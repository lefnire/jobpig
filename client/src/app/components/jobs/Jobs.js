import React, {Component} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Job from './Job';
import SeedTags from './SeedTags'
import {_fetch, constants} from '../../helpers';
const {FILTERS} = constants;

export default class Jobs extends Component {
  constructor() {
    super();
    this.state = {
      isFetching: true,
      jobs: []
    };
  }

  componentDidMount() {
    this._fetchJobs();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.filter !== this.props.params.filter) {
      this._fetchJobs(nextProps.params.filter);
    }
  }

  render() {
    let {filter} = this.props.params;
    let fetching = this.state.isFetching || (!this.state.jobs[0] && filter === 'match');
    let isEmpty = !fetching && this.state.jobs.length === 0;

    let emptySection = (
      <div className="padded">
        <mui.Card>
          {filter === 'liked'?
            <mui.CardText>
              <p className="empty-text">Your liked page will be filled with jobs that you have liked. You can use this page to keep track of jobs you
              are interested in. Once you have applied to a job, click on the "APPLIED" button, and your job will
              be moved over to the "APPLIED" page.</p>
            </mui.CardText>
          : filter === 'disliked'?
            <mui.CardText className="empty-text">
              <p style={styles.empty}>This page is frankly really stupid. If you are dumb and made mistate by hitting disliked you can come here and change your mind about a disliked job and like it.</p>
            </mui.CardText>
          :
            <mui.CardText>
              <div className="empty-text">
                <p>Your applied job page will be filled with jobs that you have applied to.
                Use this page to follow up with jobs you have applied to. You can make notes
                by clicking the "ADD NOTE" button. For example:</p>
                <ul>
                  <li>Emailed jim@jobs.com on 1/13/16.</li>
                  <li>Followed up by contacting the HR department and leaving my telephone number on 1/15/16.</li>
                  <li>Jim called and scheduled a Skype interview for 1/18/18.</li>
                  <li>Jim asked to have my profile page available and ready to show the company on the call.</li>
                </ul>
              </div>
            </mui.CardText>
          }
          </mui.Card>
      </div>
    );

    return (
      <div>
        <SeedTags onSeed={() => this._fetchJobs()} auto={true} />
        {fetching? <mui.CircularProgress mode="indeterminate" size={1.5} />
          : isEmpty? emptySection
          : this.state.jobs.map(job =>
            <Job job={job} key={job.id} onSetStatus={() => this._fetchJobs()} />
          )
        }
      </div>
    );
  }

  _fetchJobs = (filter) => {
    this.setState({isFetching: true});
    filter = (filter || this.props.params.filter);
    _fetch(`jobs/${filter}`).then(jobs => {
      if (_.isEmpty(jobs) && filter === 'match') // poll for new jobs (the server is crunching)
        return window.setTimeout(this._fetchJobs, 2000);
      this.setState({jobs, isFetching: false});
    });
  }
}
