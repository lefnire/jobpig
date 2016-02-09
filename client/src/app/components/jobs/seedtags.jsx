import React, {Component} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch} from '../../helpers';

export default class SeedTags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
    this._shouldSeedTags();
  }

  render() {
    const actions = [
      <mui.FlatButton
        label="Skip"
        secondary={true}
        onTouchTap={() => {
          this._seedSkipped=true;
          this.handleClose();
        }}
      />,
      <mui.FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._seedTags}
      />,
    ];

    return (
      <mui.Dialog title="Seed Tags"
                  actions={actions}
                  modal={false}
                  open={this.state.open}
                  onRequestClose={this.handleClose}>
        <p>You'll be thumbing your way to custom jobs in no time! You can either kickstart it here with a few words for jobs you're looking for (eg "react, angular, node") or you can skip this part and start thumbing.</p>
        <mui.TextField hintText="Enter a few tags (comma-delimited)" ref='tags' type='text' fullWidth={true} />
      </mui.Dialog>
    );
  }

  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});

  _shouldSeedTags = () => {
    _fetch('user').then(user => {
      if (_.isEmpty(user.tags) && !this._seedSkipped)
        this.handleOpen();
    });
  }

  _seedTags = () => {
    _fetch('user/seed-tags', {method:"POST", body: {
      tags: this.refs.tags.getValue()
    }}).then(() => {
      this.handleClose();
      this.props.onSeed();
    });
  };
}