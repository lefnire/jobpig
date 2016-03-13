import React from 'react';
import mui from 'material-ui';

export default class Alerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    return (
      <mui.Snackbar
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
              Fill out profile, then head to
              {' '}<a href="/#/inbox" onClick={this.close} style={{color: 'white'}}>Inbox</a>
            </span>
          ),
          PASSWORD_RESET: "Password successfully reset, please log in.",
        }[key],
        opts: {
          FILL_PROFILE: {autoHideDuration: 0}
        }[key]
      });
    }
  };

  alert = message => this.setState({open: true, message});
};