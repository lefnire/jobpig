import React from 'react';
import {
  Snackbar
} from 'material-ui';

export default class Alerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    if (!this.state.message) return null;
    return (
      <Snackbar
        open={this.state.open}
        message={this.state.message}
        autoHideDuration={6000}
        onRequestClose={this.close}
        {...this.state.opts}
      />
    );
  }

  close = () => {
    this.setState({
      open: false,
      opts: null
    })
  };

  flash = loc => {
    let key = loc.query.flash;
    if (key) {
      //FILL_PROFILE: Take a moment to fill out your profile, so employers can scope you out!
      this.setState({
        open: true,
        message: {
          FILL_PROFILE: (
            <span>
              <a style={{cursor: 'pointer', color: 'red', marginRight: 10}} onClick={this.close}>&#x2716;</a>
              Fill <a href="/#/profile" onClick={this.close} style={{color: 'white'}}>profile</a> so employers can find you!
            </span>
          ),
          POST_JOB: `Click "Post Job" top right; you'll attract matching candidates in no time!`,
          PASSWORD_RESET: "Password successfully reset, please log in.",
        }[key],
        opts: {
          FILL_PROFILE: {autoHideDuration: 0}
        }[key]
      });
    }
  };

  alert = message => this.setState({open: true, message: _.get(message, 'json.message', message)}); // try err.json.message (common), fall back on message
};