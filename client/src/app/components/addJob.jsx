var React = require('react'),
  mui = require('material-ui'),
  _ = require('lodash'),
  request = require('superagent');

module.exports = React.createClass({
  show: function(){
    this.refs.dialog.show();
  },
  render() {
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Submit', onTouchTap: this._addJob, ref: 'submit' }
    ];
    return (
      <mui.Dialog title="Add Job" actions={standardActions} ref="dialog">
        <mui.ClearFix>
          <mui.TextField ref='title' hintText="Title" autofocus={true} /><br/>
          <mui.TextField ref='company' hintText="Company" /><br/>
          <mui.TextField ref='industry' hintText="Industry" /><br/>
          <mui.TextField ref='skills' hintText="Skills (comma-delimited)" /><br/>
          <mui.TextField ref='note' hintText="Note" multiLine={true} /><br/>
        </mui.ClearFix>
      </mui.Dialog>
    )
  },
  _addJob(){
    var body = _.transform({company:1,industry:1,skills:1,note:1}, (m,v,k)=> m[k]=this.refs[k].getValue());
    request.post('/jobs', body).end(()=>this.props.onAction());
  }
});

