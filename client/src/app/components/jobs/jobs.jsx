import React, {Component} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Job from './job.jsx';
import {_fetch} from '../../helpers';

export default class Jobs extends Component {
  constructor() {
    super();
    this.state = {
      isFetching: true,
      jobs: [],
      editing: 0
    };
  }

  componentDidMount() {
    this._fetchJobs();
    this._shouldSeedTags();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.filter !== this.props.params.filter) {
      this._fetchJobs(nextProps.params.filter);
    }
  }

  render() {
    let isInbox = this.props.params.filter === 'inbox';
    let dialogActions = [
      { text: 'Skip', onTouchTap:() => {
        this._seedSkipped=true;
        this.refs.dialog.dismiss()
      } },
      { text: 'Submit', onTouchTap: ()=>this._seedTags(), ref: 'submit' }
    ];

    let fetching = this.state.isFetching || (!this.state.jobs[0] && isInbox);

    return <div>
      <mui.Dialog ref='dialog' actions={dialogActions}>
        <p>You'll be thumbing your way to custom jobs in no time! You can either kickstart it here with a few words for jobs you're looking for (eg "react, angular, node") or you can skip this part and start thumbing.</p>
        <mui.TextField hintText="Enter a few tags (comma-delimited)" ref='tags' type='text' fullWidth={true} />
      </mui.Dialog>
      {fetching ? <mui.CircularProgress mode="indeterminate" size={1.5} />
        : this.state.jobs.map(job =>
          <Job job={job} key={job.id} onSetStatus={() => this._fetchJobs()} />
        )
      }
    </div>
  }

  _shouldSeedTags = () => {
    _fetch('user').then(json => {
      if (_.isEmpty(json.tags) && !this._seedSkipped)
        this.refs.dialog.show();
    });
  }

  _seedTags = () => {
    _fetch('user/seed-tags', {method:"POST", body: {
      tags: this.refs.tags.getValue()
    }}).then(() => {
      this.refs.dialog.dismiss();
      this._fetchJobs();
    });
  };

  _fetchJobs = (filter) => {
    this.setState({isFetching: true});
    filter = filter || this.props.params.filter;
    _fetch(`jobs/${filter}`).then(jobs => {
      if (_.isEmpty(jobs) && filter === 'inbox') // poll for new jobs (the server is crunching)
        return window.setTimeout(() => this._fetchJobs(), 2000);
      this.setState({jobs, isFetching: false});
    });
  }
}