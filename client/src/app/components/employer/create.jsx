import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch} from '../../helpers';

export default class CreateJob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    const actions = [
      <mui.FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={this.handleClose}
      />,
      <mui.FlatButton
          label="Submit"
          primary={true}
          onTouchTap={this._createJob}
      />,
    ];

    //Handle on server: key, source
    return (
      <mui.Dialog
          title="Create Job"
          actions={actions}
          modal={true}
          open={this.state.open}
      >
        <mui.ClearFix>
          <mui.TextField ref='title' required={true} type='text' hintText="*Title" autofocus={true} fullWidth={true}/>
          <mui.TextField ref='company' required={true} type='text' hintText="*Company" fullWidth={true}/>
          <mui.TextField ref='location' type='text' hintText="Location" />
          <mui.Checkbox ref="remote" label="Remote"/><br/>
          {/*remote*/}
          {/*url?*/}
          <mui.TextField ref='tags' type='text' hintText="*Skills/Tags (comma-delimited)" multiLine={true} fullWidth={true}/>
          <mui.TextField ref='money' type='number' hintText="Money (budget, salary, hourly-rate, etc)" fullWidth={true}/>
          <mui.TextField ref='description' required={true} hintText="*Description" multiLine={true} fullWidth={true}/>
        </mui.ClearFix>
      </mui.Dialog>
    )
  }

  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});

  _createJob = () => {
    this.handleClose();
    let body = _.reduce('title company location remote tags money description'.split(' '), (m, v) => {
      let el = this.refs[v];
      m[v] = el.isChecked ? el.isChecked() : el.getValue();
      return m;
    },{});
    _fetch('jobs', {method:"POST", body}).then(this.props.onCreate);
  };
}

