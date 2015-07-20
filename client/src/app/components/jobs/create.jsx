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
    return (
      <mui.Dialog title="Add Job" actions={standardActions} ref="dialog">
        <mui.ClearFix>
          <mui.TextField ref='title' hintText="Title" autofocus={true}/><br/>
          <mui.TextField ref='company' hintText="Company"/><br/>
          <mui.TextField ref='industry' hintText="Industry"/><br/>
          <mui.TextField ref='skills' hintText="Skills (comma-delimited)"/><br/>
          <mui.TextField ref='note' hintText="Note" multiLine={true}/>
        </mui.ClearFix>
      </mui.Dialog>
    )
  }

  show() {
    this.refs.dialog.show();
  }

  _createJob() {
    var body = _.transform({company: 1, industry: 1, skills: 1, note: 1}, (m, v, k)=> m[k] = this.refs[k].getValue());
    request.post('/jobs', body).end(()=>this.props.onAction());
  }
}

