import React from 'react';
import mui from 'material-ui';
import {HotKeys} from 'react-hotkeys';
import _ from 'lodash';
import Job from './job.jsx';
import request from 'superagent';
import utils from '../../lib/utils';

//Alt
import alt from '../../lib/alt';
import JobStore from '../../lib/JobStore';
import JobActions from '../../lib/JobActions';
import connectToStores from 'alt/utils/connectToStores';

let {Colors} = mui.Styles;

@connectToStores
class Jobs extends React.Component {

  constructor(){
    super();

    this.shortcuts = utils.setupHotkeys({
      up: {k:'k', fn:this._action_up.bind(this)},
      down: {k:'j', fn:this._action_down.bind(this)}
    });
    this.state = {
      focus: 0
    };
    JobActions.fetch();
  }

  static getStores() {
    return [JobStore];
  }

  static getPropsFromStores() {
    return JobStore.getState();
  }

  render() {
    var mode = this.props.editing ? 'editing' : 'default';

    // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
    window.setTimeout(()=> this.props.jobs.length < 1 && this.refs.hotkeys.getDOMNode().focus());

    if (!this.props.jobs[0])
      return <mui.CircularProgress mode="indeterminate" size={1.5} />;

    return <HotKeys tabIndex="0"
       keyMap={this.shortcuts[mode].keys}
       handlers={this.shortcuts[mode].handlers}
       ref='hotkeys' >
      {this.props.jobs.map((job, i)=> {
        return <Job
          job={job}
          key={job.id}
          focus={i==this.state.focus}
          i={i}
          onAction={JobActions.fetch}
          />
      })}
    </HotKeys>
  }

  // Actions
  _action_up() {
    let focus = this.state.focus - 1;
    if (focus < 0) return;
    this.setState({focus});
  }

  _action_down() {
    let focus = this.state.focus + 1;
    if (focus > this.jobsLen - 1) return;
    this.setState({focus});
  }
}

export default Jobs;