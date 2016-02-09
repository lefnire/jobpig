import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';

export default class Contact extends React.Component {
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
        keyboardFocused={true}
        onTouchTap={this.handleClose}
      />,
    ];

    return (
      <mui.Dialog
        title="Contact"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        <mui.ClearFix>
          <mui.TextField hintText="Subject" fullWidth={true}/>
          <mui.TextField hintText="Message" fullWidth={true} multiLine={true} />
        </mui.ClearFix>
      </mui.Dialog>
    );
  }

  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});
}