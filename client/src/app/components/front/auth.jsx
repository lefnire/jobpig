import React from 'react';
import mui from 'material-ui';
import request from 'superagent';
import _ from 'lodash';
import validator from 'validator';

class Login extends React.Component{
  render(){
    return <form action='/login' method='POST'>
    {[
      {hint:'Email Address', name:'email', type:'email'},
      {hint:'Password', name:'password', type:'password'},
    ].map(f=> <mui.TextField
      hintText={f.hint}
      name={f.name}
      ref={f.name}
      type={f.type}
      required={true}
      fullWidth={true}
      />
    )}
      <mui.RaisedButton primary={true} label='Submit' type='submit'/>
    </form>
  }

  //FIXME once we get JWT working, enable for errors instead of current redirect+error_dump
  _login(){
    request.post('/login')
      .send({email:this.refs.email.getValue(), password:this.refs.email.getValue()})
      .end(()=>{
        console.log(arguments);
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
    return <form action='/register' method='POST' onSubmit={()=>this._submit()}>
      {[
        {hint:'Email Address', name:'email', type:'email'},
        {hint:'Password', name:'password', type:'password'},
        {hint:'Confirm Password', name:'confirmPassword', type:'password'}
      ].map(f=> <mui.TextField
        hintText={f.hint}
        name={f.name}
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

  _submit(){
    this._validate();
    return _.isEmpty(this.state.errors);
  }

  _validate(f){
    var v = this.refs[f].getValue(),
      e = {};
    if ( (f=='email' || !f) && !validator.isEmail(v))
      e[f] = 'Please enter an email address';
    if ( (f=='password' || !f) && v.length<3)
      e[f] = 'Password must be greater than 3 characters';
    if ( (f=='confirmPassword' || !f) && v!=this.refs.password.getValue())
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
