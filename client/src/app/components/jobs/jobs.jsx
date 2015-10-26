import React, {Component, PropTypes} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Job from './job.jsx';
import {request} from '../../util';

import { connect, dispatch } from 'react-redux';
import { pushState } from 'redux-router';
import { fetchJobs, setStatus, setEditing, saveNote } from '../../actions';

let {Colors} = mui.Styles;

class Jobs extends Component {

  componentDidMount() {
    const { fetchJobs, filter } = this.props;
    fetchJobs(filter);

    //request.get('/user').end((err,res)=>{
    //  if (_.isEmpty(res.body.tags) && !this._seedSkipped)
    //    this.refs.dialog.show();
    //});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.filter !== this.props.filter) {
      const { fetchJobs, filter } = nextProps;
      fetchJobs(filter);
    }
  }

  render() {
    let dialogActions = [
      { text: 'Skip', onTouchTap:()=>{this._seedSkipped=true;this.refs.dialog.dismiss();} },
      { text: 'Submit', onTouchTap: ()=>this._seedTags(), ref: 'submit' }
    ];

    let fetching = this.props.isFetching || (!this.props.jobs[0] && this.props.filter==='inbox');

    return <div>
      <mui.Dialog ref='dialog' actions={dialogActions}>
        <p>You'll be thumbing your way to custom jobs in no time! You can either kickstart it here with a few words for jobs you're looking for (eg "react, angular, node") or you can skip this part and start thumbing.</p>
        <mui.TextField hintText="Enter a few tags (comma-delimited)" ref='tags' type='text' fullWidth={true} />
      </mui.Dialog>
      { fetching ?
        <mui.CircularProgress mode="indeterminate" size={1.5} />
        : this.props.jobs.map(job =>
          <Job
            job={job}
            key={job.id}
            onSetStatus={this.props.setStatus}
            onSetEditing={this.props.setEditing}
            onSaveNote={this.props.saveNote}
            editing={this.props.editing === job.id} />
        )
      }
    </div>
  }

  _seedTags(){
    request.post('/user/seed-tags')
      .send({tags:this.refs.tags.getValue()})
      .end(()=>{
        this.refs.dialog.dismiss();
        this.props.fetchJobs();
      });
  }
}

Jobs.propTypes = {
  filter: PropTypes.string.isRequired,
  jobs: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  editing: PropTypes.number.isRequired,
};


function mapStateToProps(state) {
  const { isFetching, jobs, editing } = state.jobs || { isFetching: true, jobs: [], editing: 0};
  return { jobs, isFetching, editing, filter: state.router.params.filter };
}

export default connect(
  mapStateToProps,
  { pushState, fetchJobs, setStatus, setEditing, saveNote }
)(Jobs);
