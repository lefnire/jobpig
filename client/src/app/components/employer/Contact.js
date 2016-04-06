import React from 'react';
import MUI from 'material-ui';
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
      <MUI.FlatButton label="Cancel" secondary={true} onTouchTap={this.handleClose}/>,
      <MUI.FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={() => this.refs.form.submit()}/>,
    ];

    return (
      <MUI.Dialog
        title="Contact"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        <MUI.ClearFix>
          <Formsy.Form
          ref="form"
          onValid={() => this.setState({canSubmit: true})}
          onInvalid={() => this.setState({canSubmit: false})}
          onValidSubmit={this.submitForm}>
            <fui.FormsyText hintText="Subject" name="subject" required validationError="required" fullWidth={true}/>
            <fui.FormsyText hintText="Message" name="body" required validationError="required" fullWidth={true} multiLine={true} />
          </Formsy.Form>
        </MUI.ClearFix>
      </MUI.Dialog>
    );
  }

  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});
  submitForm = (body) => {
    _fetch(`messages/contact/${this.props.prospect.id}`, {method:"POST", body}).then(() => {
      global.jobpig.alerts.alert('Message sent.');
      this.handleClose();
    }).catch(global.jobpig.alerts.alert);
  }
}