import React, {Component} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch, getTags, me} from '../../helpers';
import Select from 'react-select';

export default class SeedTags extends React.Component {
  constructor() {
    super();
    this.state = {open: false};
  }

  componentWillMount() {
    if (this.props.auto)
      this._shouldSeedTags();
  }

  render() {
    const actions = [
      <mui.FlatButton
        label="Skip"
        secondary={true}
        onTouchTap={() => {
          this._seedSkipped=true;
          this.close();
        }}
      />,
      <mui.FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._seedTags}
      />,
    ];

    // Select.Async#menuContainerStyle={{zIndex:1600}} may be necessary (Mui.Dialog's is 1500)
    return (
      <mui.Dialog title="Seed Tags"
        bodyStyle={{overflow: 'visible'}}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.close}>
        <p>You'll be thumbing your way to custom jobs in no time! You can either kickstart it here with a few words for jobs you're looking for (eg "react, angular, node") or you can skip this part and start thumbing.</p>
        <Select.Async
          multi={true}
          value={this.state.selected}
          loadOptions={() => getTags().then(options => {return {options}}) }
          onChange={selected => this.setState({selected})}
        />
      </mui.Dialog>
    );
  }

  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  _shouldSeedTags = () => {
    me().then(user => {
      if (_.isEmpty(user.tags) && !this._seedSkipped)
        this.open();
    });
  };

  _seedTags = () => {
    let tags = _.map(this.state.selected, 'label').join(',');
    _fetch('user/seed-tags', {method:"POST", body: {tags}}).then(() => {
      this.close();
      this.props.onSeed();
    });
  };
}