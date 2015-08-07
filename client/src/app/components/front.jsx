import React from 'react';
import mui from 'material-ui';
import request from 'superagent';

export default class Front extends React.Component {
  render(){
    return <div>
      {/*<h1>
       <a href='/auth/linkedin' className='zocial linkedin'>Login or Register</a>
       </h1>*/}
      <h2>Login</h2>
      <form action='#' onSubmit={()=>this._login()}>
        <mui.TextField required={true} ref='login_email' type='email' hintText='Email Address' fullWidth={true} />
        <mui.TextField required={true} ref='login_password' type='password' hintText='Password' fullWidth={true} />
        <mui.RaisedButton primary={true} label='Submit' type='submit'/>
      </form>
      <h2>Register</h2>
      <form action='#' onSubmit={()=>this._register()}>
        <mui.TextField required={true} ref='register_email' type='email' hintText='Email Address' fullWidth={true} />
        <mui.TextField required={true} ref='register_password' type='password' hintText='Password' fullWidth={true} />
        <mui.TextField required={true} ref='register_confirmPassword' type='password' hintText='Confirm Password' fullWidth={true} />
        <mui.RaisedButton primary={true} label='Submit' type='submit'/>
      </form>
    </div>
  }
  _register(){
    if (this.refs.register_password.getValue() != this.refs.register_confirmPassword.getValue()) return alert('Password!=Confirm');
    request.post('/register',{
      email:this.refs.register_email.getValue(),
      password:this.refs.register_password.getValue()
    }).end(()=>location.reload(true))
  }
  _login(){
    request.post('/login',{
      email:this.refs.login_email.getValue(),
      password:this.refs.login_password.getValue()
    }).end(()=>location.reload(true))
  }
}
Front.contextTypes = {
  router: React.PropTypes.func.isRequired
};