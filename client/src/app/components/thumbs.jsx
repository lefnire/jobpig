var React = require('react'),
  mui = require('material-ui'),
  _ = require('lodash'),
  request = require('superagent');

module.exports = React.createClass({
  show: function(action){
    this.setState({action});
    this.refs.dialog.show();
  },
  getInitialState(){
    return {
      action:'Like'
    }
  },
  render() {
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Submit', onTouchTap: this._sendThumb, ref: 'submit' }
    ];
    var tags = this.props.job.tags;
    return (
      <mui.Dialog title={this.state.action+':'} actions={standardActions} ref="dialog">

        <h3>Company</h3>
        <mui.Checkbox name="company" value="company" label={this.props.job.company} disabled={true} ref='company.[company.id]' />

        <h3>Industry</h3>
        <mui.Checkbox name="company" value="company" label="Nonprofit" disabled={true} ref='industry.[industry.id]' />

        <h3>Skills</h3>
        {tags[0] && tags.map((tag,i)=>
          <mui.Checkbox name={tag.id} value={tag.id} label={tag.text} defaultChecked={true} ref={'tag.'+tag.id} />
        )}

      </mui.Dialog>
    )
  },
  _sendThumb(){
    var dir = {Like:1, Dislike:-1}[this.state.action];
    var body = _.reduce(this.refs,function(m,v,k){
      if (v.isChecked && v.isChecked()) m[k] = true;
      return m;
    }, {});
    request.post(`/jobs/${this.props.job.id}/${dir}`, body).end(()=> {
      this.props.onAction();
    })
  }
});

