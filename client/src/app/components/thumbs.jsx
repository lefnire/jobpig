let React = require('react');
let mui = require('material-ui');
var _ = require('lodash');

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
      { text: 'Submit', onTouchTap: this._onDialogSubmit, ref: 'submit' }
    ];
    return (
      <mui.Dialog title={this.state.action+':'} actions={standardActions} ref="dialog">

        <h3>Company</h3>
        <mui.Checkbox name="company" value="company" label={this.props.job.company} defaultChecked={true}/>

        <h3>Industry</h3>
        <mui.Checkbox name="company" value="company" label="Nonprofit" defaultChecked={true}/>

        <h3>Skills</h3>
        {this.props.job.tags.map((tag,i)=> <mui.Checkbox name={i} value={i} label={tag} defaultChecked={true}/> )}

      </mui.Dialog>
    )
  }
});

