import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import request from 'superagent';



export default class CreateJob extends React.Component {
  constructor(){
    super();
    this.show = this.show.bind(this);
  }
  render() {
    let standardActions = [
      {text: 'Cancel'},
      {text: 'Submit', onTouchTap: this._createJob.bind(this), ref: 'submit'}
    ];
    //Handle on server: key, source
    return (
      <mui.Dialog title="Create Job" actions={standardActions} ref="dialog">
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

  show() {
    this.refs.dialog.show();
  }

  _createJob() {

    var body = _.reduce('title company location remote tags money description'.split(' '), (m, v)=> {
      var el = this.refs[v];
      m[v] = el.isChecked ? el.isChecked() : el.getValue();
      return m;
    },{});
    request.post('/jobs', body).end(()=>this.props.onAction());
  }
}

