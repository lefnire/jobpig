import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import validator from 'validator';
import { login, logout, _fetch } from '../../actions';

let _err = (err) => err.json.message || err.response.statusText

class Login extends React.Component{
  constructor(){
    super();
    this.state = {errors:{}};
  }

  render(){
    console.log(this.state);
    return <form role='form' onSubmit={this._submit.bind(this)}>
    {[
      {hint:'Email Address', name:'email', type:'email'},
      {hint:'Password', name:'password', type:'password'},
    ].map(f=> <mui.TextField
      hintText={f.hint}
      ref={f.name}
      type={f.type}
      errorText={this.state.errors[f.name]}
      required={true}
      fullWidth={true}
      />
    )}
      <mui.RaisedButton primary={true} label='Submit' type='submit'/>
    </form>
  }

  _submit(e){
    e.preventDefault();
    _fetch(`login`, {method:"POST", body:{
      email: this.refs.email.getValue(),
      password: this.refs.password.getValue()
    }})
      .then(json=> login(json.token))
      .catch(err=> this.setState({errors:{password:_err(err)}}) )
  }
}

class Register extends React.Component{
  constructor(){
    super();
    this.state = {
      errors:{}
    };
  }
  render(){
    return <form role='form' onSubmit={this._submit.bind(this)}>
      {[
        {hint:'Email Address', name:'email', type:'email'},
        {hint:'Password', name:'password', type:'password'},
        {hint:'Confirm Password', name:'confirmPassword', type:'password'}
      ].map(f=> <mui.TextField
        hintText={f.hint}
        ref={f.name}
        type={f.type}
        errorText={this.state.errors[f.name]}
        onBlur={this._validate.bind(this, f.name)}
        required={true}
        fullWidth={true}
        />
      )}
      <mui.RaisedButton primary={true} label='Submit' type='submit'/>
    </form>
  }

  _submit(e){
    e.preventDefault();
    ['email','password','confirmPassword'].forEach(f=>this._validate(f))
    if (!_.isEmpty(this.state.errors))
      return false;
    _fetch('register', {method:"POST", body:{
      email: this.refs.email.getValue(),
      password: this.refs.password.getValue(),
      confirmPassword: this.refs.confirmPassword.getValue()
    }})
      .then(json=> login(json.token))
      .catch(err => this.setState({errors:{confirmPassword:_err(err)}}) )
  }

  _validate(f){
    let v = this.refs[f].getValue(),
      e = {};
    if (f==='email' && !validator.isEmail(v))
      e[f] = 'Please enter an email address';
    if (f==='password' && v.length<3)
      e[f] = 'Password must be greater than 3 characters';
    if (f==='confirmPassword' && v!==this.refs.password.getValue())
      e[f] = "Passwords don't match";
    this.setState({errors:e});
  }
}

export default class Auth extends React.Component{
  constructor(){
    super();
    this.show = this.show.bind(this);
  }

  render() {
    return <mui.Dialog ref='dialog'>
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

  show() {
    this.refs.dialog.show();
  }
}
