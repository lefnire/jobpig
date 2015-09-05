import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Job from './job.jsx';
import {request} from '../../lib/util';

//Alt
import JobStore from '../../lib/JobStore';
import JobActions from '../../lib/JobActions';
import connectToStores from 'alt/utils/connectToStores';

let {Colors} = mui.Styles;

@connectToStores
class Jobs extends React.Component {

  constructor(){
    super();
    JobActions.fetch();
  }

  static getStores() {
    return [JobStore];
  }

  static getPropsFromStores() {
    return JobStore.getState();
  }

  render() {
    let dialogActions = [
      { text: 'Skip' },
      { text: 'Submit', onTouchTap: ()=>this._seedTags(), ref: 'submit' }
    ];

    //TODO: this depends on fact that request.get is async (aka, window.setTimeout). Move this to a post-render function
    request.get('/user').end((err,res)=>{
      if (_.isEmpty(res.body.tags))
        this.refs.dialog.show();
    });

    return <div>
      <mui.Dialog ref='dialog' actions={dialogActions}>
        <p>You'll be thumbing your way to custom jobs in no time! You can either kickstart it here with a few words for jobs you're looking for (eg "react, angular, node") or you can skip this part and start thumbing.</p>
        <mui.TextField hintText="Enter a few tags (comma-delimited)" ref='tags' type='text' fullWidth={true} />
      </mui.Dialog>
      {(!this.props.jobs[0] && window.location.hash=="#/jobs/inbox") ?
          <mui.CircularProgress mode="indeterminate" size={1.5} />
        : this.props.jobs.map(job=> <Job job={job} key={job.id} onAction={JobActions.fetch}/>)}
    </div>
  }

  _seedTags(){
    request.post('/user/seed-tags')
      .send({tags:this.refs.tags.getValue()})
      .end(()=>{
        this.refs.dialog.dismiss();
        JobActions.fetch()
      });
  }
}

export default Jobs;
