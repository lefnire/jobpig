import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch} from '../../helpers';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';

export default class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      canSubmit: false
    };
  }

  render() {
    const actions = [
      <mui.FlatButton label="Cancel" secondary={true} onTouchTap={this.handleClose}/>,
      <mui.FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={() => this.refs.form.submit()}/>,
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
          <Formsy.Form
          onValid={() => this.setState({canSubmit: true})}
          onInvalid={() => this.setState({canSubmit: false})}
          onValidSubmit={this.submitForm}>
            <mui.TextField hintText="Subject" name="subject" required validationError="required" fullWidth={true}/>
            <mui.TextField hintText="Message" name="body" required validationError="required" fullWidth={true} multiLine={true} />
          </Formsy.Form>
        </mui.ClearFix>
      </mui.Dialog>
    );
  }

  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});
  submitForm = (form) => {
    debugger;
  }
}