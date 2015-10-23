import React from 'react';
import mui from 'material-ui';
import request from 'superagent';
import _ from 'lodash';
import validator from 'validator';
import util from '../../util';

let _err = (err,res) => (res && res.body && res.body.message) ? res.body.message : err;

class Login extends React.Component{
  constructor(){
    super();
    this.state = {errors:{}};
  }

  render(){
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
    request.post(`${API_URL}/login`)
      .send({
        email: this.refs.email.getValue(),
        password: this.refs.password.getValue()
      })
      .end((err,res)=>{
        if (err)
          return this.setState({errors:{password:_err(err,res)}})
        util.auth.login(res.body.token);
      })
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
    request.post(`${API_URL}/register`)
      .send({
        email: this.refs.email.getValue(),
        password: this.refs.password.getValue(),
        confirmPassword: this.refs.confirmPassword.getValue()
      })
      .end((err, res)=>{
        if (err)
          return this.setState({errors:{confirmPassword:_err(err,res)}})
        util.auth.login(res.body.token);
      })
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
