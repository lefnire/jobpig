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
    if (!this.props.jobs[0])
      return <mui.CircularProgress mode="indeterminate" size={1.5} />;

    return <div>
      {this.props.jobs.map(job=> <Job
        job={job}
        key={job.id}
        onAction={JobActions.fetch}
        />
      )}
    </div>
  }
}

export default Jobs;