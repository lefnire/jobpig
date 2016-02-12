import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {login, logout, _fetch} from '../../helpers';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';

class Error extends React.Component {
  render(){
    if (!this.props.error) return null;
    let err = this.props.error.json.message || this.props.error.response.statusText;
    return <div style={{color:'red'}}>{err}</div>;
  }
}

class Login extends React.Component {
  constructor(){
    super();
    this.state = {
      error: null,
      canSubmit: false
    };
  }

  render(){
    return (
      <Formsy.Form
        ref="form"
        onValid={() => this.setState({canSubmit: true})}
        onInvalid={() => this.setState({canSubmit: false})}
        onValidSubmit={this.submitForm}>
        <Error error={this.state.error} />
        <fui.FormsyText
          name='email'
          required
          hintText="Email Address"
          fullWidth={true}
          validations="isEmail"
          validationError="Please enter a valid email address"
          type="email"/>
        <fui.FormsyText
          name="password"
          required
          hintText="Password"
          fullWidth={true}
          type="password"/>
        <mui.RaisedButton type="submit" label="Submit" primary={true} disabled={!this.state.canSubmit}/>
      </Formsy.Form>
    );
  }

  submitForm = (body) => {
    _fetch(`login`, {method:"POST", body})
      .then(json => login(json.token))
      .catch(error => this.setState({error}))
  }
}

class Register extends React.Component{
  constructor(){
    super();
    this.state = {
      error: null,
      canSubmit: false
    };
  }
  render(){
    return (
      <Formsy.Form
        ref="form"
        onValid={() => this.setState({canSubmit: true})}
        onInvalid={() => this.setState({canSubmit: false})}
        onValidSubmit={this.submitForm}>
        <Error error={this.state.error} />
        <fui.FormsyText
          name='email'
          required
          hintText="Email Address"
          fullWidth={true}
          validations="isEmail"
          validationError="Please enter an email address"
          type="email"/>
        <fui.FormsyText
          name="password"
          required
          hintText="Password"
          validations="minLength:3"
          validationError="Password must be at least 3 characters"
          fullWidth={true}
          type="password"/>
        <fui.FormsyText
          name="confirmPassword"
          required
          validations="equalsField:password"
          validationError="Passwords don't match"
          hintText="Confirm Password"
          fullWidth={true}
          type="password"/>
        <mui.RaisedButton primary={true} label='Submit' type='submit' disabled={!this.state.canSubmit}/>
      </Formsy.Form>
    )
  }

  submitForm = (body) => {
    _fetch('register', {method:"POST", body})
      .then(json => login(json.token))
      .catch(error => this.setState({error}))
  }
}

export default class Auth extends React.Component {
  constructor(){
    super();
    this.state = {
      open: false,
    };
  }

  render() {
    const actions = [
      <mui.FlatButton
          label="Cancel"
          secondary={true}
          onTouchTap={this.handleClose}
      />,
      //<mui.FlatButton
      //    label="Submit"
      //    primary={true}
      //    disabled={true}
      //    onTouchTap={this.handleClose}
      ///>,
    ];
    return <mui.Dialog
        actions={actions}
        modal={true}
        open={this.state.open}>
      <mui.Tabs>
        <mui.Tab label="Login" >
          <Login />
        </mui.Tab>
        <mui.Tab label="Register" >
          <Register />
        </mui.Tab>
      </mui.Tabs>
    </mui.Dialog>
  }

  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});

}
