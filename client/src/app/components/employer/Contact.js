import React from 'react';
import MUI from 'material-ui';
import _ from 'lodash';
import {_fetch, _ga} from '../../helpers';
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
      <MUI.FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>,
      <MUI.FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={() => this.refs.form.submit()}/>,
    ];

    return (
      <MUI.Dialog
        title="Contact"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.close}
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

  open = () => {
    _ga.pageview('modal:contact-prospect');
    this.setState({open: true});
  };
  close = () => {
    _ga.pageview();
    this.setState({open: false});
  };

  submitForm = (body) => {
    _fetch(`messages/contact/${this.props.prospect.id}`, {method:"POST", body}).then(() => {
      global.jobpig.alerts.alert('Message sent.');
      this.close();
    }).catch(global.jobpig.alerts.alert);
  }
}