import React, {Component} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Job from './job';
import SeedTags from './seedtags'
import {_fetch} from '../../helpers';

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
    let isInbox = this.props.params.filter === 'inbox';
    let fetching = this.state.isFetching || (!this.state.jobs[0] && isInbox);
    let isEmpty = !fetching && this.state.jobs.length === 0;

    let emptySection = (
      <div>
        <h1>Empty</h1>
        <p>This section will be populated once you've done some stuff</p>
      </div>
    );

    return <div>
      <SeedTags onSeed={this._fetchJobs} />
      {fetching? <mui.CircularProgress mode="indeterminate" size={1.5} />
        : isEmpty? emptySection
        : this.state.jobs.map(job =>
          <Job job={job} key={job.id} onSetStatus={this._fetchJobs} />
        )
      }
    </div>
  }

  _fetchJobs = (filter) => {
    this.setState({isFetching: true});
    filter = filter || this.props.params.filter;
    _fetch(`jobs/${filter}`).then(jobs => {
      if (_.isEmpty(jobs) && filter === 'inbox') // poll for new jobs (the server is crunching)
        return window.setTimeout(this._fetchJobs, 2000);
      this.setState({jobs, isFetching: false});
    });
  }
}