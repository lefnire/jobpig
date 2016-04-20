import React from 'react';
import {
  AppBar,
  Card,
  CardHeader,
  CardText,
} from 'material-ui';
import Formsy from 'formsy-react'
import {
  FormsyText
} from 'formsy-material-ui/lib';
import {_fetch} from '../../helpers';
import Error from '../Error';

export default class ResetPassword extends React.Component {

  constructor(){
    super();
    this.state = {error: null};
  }

  render() {
    let {query} = this.props.location;
    return (
      <div>
        <AppBar title="Jobpig Password Reset" />
        <Card>
          <CardHeader title={"Reset Password for " + query.email} />
          <CardText>
            <Formsy.Form
              ref="form"
              onValid={() => this.setState({canSubmit: true})}
              onInvalid={() => this.setState({canSubmit: false})}
              onValidSubmit={this.submitForm}>
              <Error error={this.state.error} />
              <FormsyText
                name="password"
                required
                hintText="New Password"
                validations="minLength:3"
                validationError="Password must be at least 3 characters"
                fullWidth={true}
                type="password"/>
              <FormsyText
                name="confirmPassword"
                required
                validations="equalsField:password"
                validationError="Passwords don't match"
                hintText="Confirm Password"
                fullWidth={true}
                type="password"/>
              <RaisedButton primary={true} label='Submit' type='submit' disabled={!this.state.canSubmit}/>
            </Formsy.Form>

          </CardText>
        </Card>
      </div>
    );
  }

  submitForm = (body) => {
    let {query} = this.props.location;
    _fetch('user/reset-password', {method: "POST", body: {
      password: body.password,
      resetPasswordKey: query.key,
      username: query.email
    }})
    .then(() => window.location = '/#/?flash=PASSWORD_RESET')
    .catch(error => this.setState({error}));
  };
}