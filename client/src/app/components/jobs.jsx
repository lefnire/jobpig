/** In this file, we create a React component which incorporates components provided by material-ui */

import React from 'react';
import mui from 'material-ui';
import {HotKeys, HotKeyMapMixin} from 'react-hotkeys';
import _ from 'lodash';
import Job from './job.jsx';
import request from 'superagent';
import Prospects from './prospects.jsx';
import AddJob from './addJob.jsx';

//Alt
import alt from '../alt/alt';
import JobStore from '../alt/JobStore';
import JobActions from '../alt/JobActions';
import connectToStores from 'alt/utils/connectToStores';

let {Colors} = mui.Styles;

// Simple "name:key sequence/s" to create a hotkey map
const keyMap = {
  up: 'k',
  down: 'j',
  showInbox: 'ctrl+i',
  showSaved: 'ctrl+s',
  showHidden: 'ctrl+h',
  showApplied: 'ctrl+a',
  showPropsects: 'ctrl+p',
  addJob: 'shift+a',
  refresh: 'ctrl+r'
};

@connectToStores
class Jobs extends React.Component {

  constructor(){
    super();
    this.state = {
      filter: 'inbox',
      focus: 0
    };
    JobActions.list();
  }

  static getStores() {
    return [JobStore];
  }

  static getPropsFromStores() {
    return JobStore.getState();
  }

  render() {
    if (!window.user) {
      return (<mui.RaisedButton label="Login" linkButton={true} href='/auth/linkedin'/>);
    }

    let handlers = this.props.editing ? {} :
      _.transform(keyMap, (m, v, k)=> m[k] = this['_action_' + k].bind(this));
    let f = this.state.filter;
    let title = _.capitalize(this.state.filter);
    let style = {
      backgroundColor: f == 'saved' ? Colors.green700 :
        f == 'hidden' ? Colors.yellow700 :
        f == 'applied' ? Colors.blue700 :
        Colors.grey700
    }

    let jobs = _(this.props.jobs)
      .filter({status: this.state.filter})
      .map((job, i)=> <Job job={job} key={job.id} focus={i==this.state.focus} i={i} onAction={JobActions.list}/>)
      .value();
    this.jobsLen = jobs.length;

    // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
    window.setTimeout(()=> this.jobsLen < 1 && this.refs.hotkeys.getDOMNode().focus());

    if (this.state.filter == 'prospects')
      jobs = <Prospects />

    return (
      <HotKeys keyMap={keyMap} handlers={handlers} ref='hotkeys'>
        <mui.AppBar title={title} style={style} iconElementRight={
          <mui.FlatButton label="Logout" linkButton={true} href='/logout' />
        }/>
        {jobs}
        <AddJob onAction={JobActions.list} ref='addJob'/>
      </HotKeys>
    );
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

  _action_showInbox() {
    this.setState({focus: 0, filter: 'inbox'});
  }

  _action_showSaved() {
    this.setState({focus: 0, filter: 'saved'});
  }

  _action_showHidden() {
    this.setState({focus: 0, filter: 'hidden'});
  }

  _action_showApplied() {
    this.setState({focus: 0, filter: 'applied'});
  }

  _action_showPropsects() {
    this.setState({focus: 0, filter: 'prospects'});
  }

  _action_refresh() {
    request.post('/jobs/refresh').end(JobActions.list);
  }

  _action_addJob() {
    this.refs.addJob.show();
  }
}

export default Jobs;