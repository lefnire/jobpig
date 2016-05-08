import React from 'react';
import {
  FlatButton,
} from 'material-ui';
import _ from 'lodash';
import {_fetch, _ga, isSmall} from '../../helpers';
import Formsy from 'formsy-react'
import {
  FormsyText
} from 'formsy-material-ui/lib';
import {
  Modal
} from 'react-bootstrap';

export default class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      canSubmit: false
    };
  }

  render() {
    return (
      <Modal show={this.state.open} onHide={this.close} bsSize="large" animation={!isSmall} >
        <Modal.Header>
          <Modal.Title>Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formsy.Form
            ref="form"
            onValid={() => this.setState({canSubmit: true})}
            onInvalid={() => this.setState({canSubmit: false})}
            onValidSubmit={this.submitForm}>
            <FormsyText hintText="Subject" name="subject" required validationError="required" fullWidth={true}/>
            <FormsyText hintText="Message" name="body" required validationError="required" fullWidth={true} multiLine={true} />
          </Formsy.Form>
        </Modal.Body>

        <Modal.Footer>
          <FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>,
          <FlatButton label="Submit" primary={true} onTouchTap={() => this.refs.form.submit()}/>,
        </Modal.Footer>
      </Modal>
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