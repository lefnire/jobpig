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
        onRequestClose={() => this.setState({open:false})}
      />
    );
  }

  flash = loc => {
    if (loc.query.flash) {
      this.setState({
        open: true,
        message: {
          FILL_PROFILE: "Please take a moment to fill out your profile, so employers can scope you out!",
          PASSWORD_RESET: "Password successfully reset, please log in.",
        }[loc.query.flash]
      });
    }
  };

  alert = message => this.setState({open: true, message});
};