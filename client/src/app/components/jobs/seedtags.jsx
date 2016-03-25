import React, {Component} from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch, getTags, me, constants, filterOptions} from '../../helpers';
import Select from 'react-select';
const {TAG_TYPES} = constants;

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
        <p>You'll be thumbing your way to matches soon, but let's kickstart it with a few must-haves. Try tags like <b>JavaScript</b>, <b>Python</b>, <b>San Francisco, CA</b>, or <b>Remote</b>.</p>
        <p>Jobpig handles attributes equally (skills, industry, location, company, is-remote, commitment, etc); so besides this seeding, you won't set search preferences - it learns.</p>
        <Select.Async
          multi={true}
          value={this.state.selected}
          loadOptions={this.loadOptions}
          onChange={selected => this.setState({selected})}
          noResultsText="Start typing"
          filterOptions={filterOptions()}
        />
      </mui.Dialog>
    );
  }

  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  loadOptions = () => {
    return Promise.all([
      getTags(TAG_TYPES.TAG),
      getTags(TAG_TYPES.LOCATION),
    ]).then(vals => ({options: vals[0].concat(vals[1])}));
  };

  _shouldSeedTags = () => {
    me().then(user => {
      if (_.isEmpty(user.tags) && !this._seedSkipped)
        this.open();
    });
  };

  _seedTags = () => {
    let tags = _.map(this.state.selected, 'value');
    _fetch('user/seed-tags', {method:"POST", body: {tags}}).then(() => {
      this.close();
      this.props.onSeed();
    });
  };
}