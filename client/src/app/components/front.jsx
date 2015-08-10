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
      <form action='/login' method='POST'>
        <mui.TextField required={true} name='email' type='email' hintText='Email Address' fullWidth={true} />
        <mui.TextField required={true} name='password' type='password' hintText='Password' fullWidth={true} />
        <mui.RaisedButton primary={true} label='Submit' type='submit'/>
      </form>
      <h2>Register</h2>
      <form action='/register' method='POST'>
        <mui.TextField required={true} name='email' type='email' hintText='Email Address' fullWidth={true} />
        <mui.TextField required={true} name='password' type='password' hintText='Password' fullWidth={true} />
        <mui.TextField required={true} name='confirmPassword' type='password' hintText='Confirm Password' fullWidth={true} />
        <mui.RaisedButton primary={true} label='Submit' type='submit'/>
      </form>
    </div>
  }
}
Front.contextTypes = {
  router: React.PropTypes.func.isRequired
};