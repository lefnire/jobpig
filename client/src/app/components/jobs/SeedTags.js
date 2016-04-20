import React, {Component} from 'react';
import update from 'react-addons-update';
import {
  FlatButton,
  Dialog,
  MenuItem,
  RaisedButton,
  Card,
  CardTitle,
  CardText,
} from 'material-ui';
import Formsy from 'formsy-react'
import {
  FormsyText,
  FormsySelect
} from 'formsy-material-ui';
import _ from 'lodash';
import {_fetch, getTags, me, constants, filterOptions} from '../../helpers';
import Select from 'react-select';
const {TAG_TYPES} = constants;

export default class SeedTags extends React.Component {
  constructor() {
    super();
    this.state = {open: false, tags: []};
  }

  componentWillMount() {
    if (this.props.auto)
      this._shouldSeedTags();
  }

  render() {
    let {open, tags, suggestion} = this.state;

    const actions = [
      <FlatButton
        label="Skip"
        secondary={true}
        onTouchTap={() => {
          this._seedSkipped=true;
          this.close();
        }}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._seedTags}
      />,
    ];

    // Select.Async#menuContainerStyle={{zIndex:1600}} may be necessary (Dialog's is 1500)
    return (
      <Dialog title="Seed Tags"
        bodyStyle={{overflow: 'visible'}}
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={this.close}>

        {!suggestion? (
          <div>
            <p>You'll be thumbing your way to matches soon, but let's kickstart with a few must-haves. Try tags like <b>Python</b>, <b>San Francisco, CA</b>, <b>Full-time</b> or <b>Remote</b>.</p>
            <p>Jobpig treats attributes equally (skills, location, company, commitment); they're all tags. Besides this seeding, you won't set search preferences - it learns.</p>
          </div>
        ) : (
          <Card>
            <CardText>
              {/*<h4>Suggest a Tag</h4>*/}
              <p>If JP has most your tags save a few, suggest them here. If it's missing most of your industry, <a href="https://cctaxonomy.com/#/16" target="_blank">add them here</a> instead</p>
              <Formsy.Form
                ref="form"
                onValid={() => this.setState({canSubmit: true})}
                onInvalid={() => this.setState({canSubmit: false})}
                onValidSubmit={this.addSuggestion}>
                <FormsyText
                  name='label'
                  required
                  ref='suggest'
                  value={suggestion.label}
                  floatingLabelText='Tag (eg "Apache Hadoop")'
                  fullWidth={true}
                />
                <FormsySelect
                  name='type'
                  required
                  value={suggestion.type}
                  floatingLabelText="Tag Type"
                  fullWidth={true}
                >
                  <MenuItem value={TAG_TYPES.SKILL} primaryText="Skill" />
                  <MenuItem value={TAG_TYPES.LOCATION} primaryText="Location" />
                  <MenuItem value={TAG_TYPES.COMPANY} primaryText="Company" />
                </FormsySelect>
                <RaisedButton label="Add" type="submit" disabled={!this.state.canSubmit} />
              </Formsy.Form>
            </CardText>
          </Card>
        )}

        <Select.Async
          multi={true}
          value={tags}
          loadOptions={this.loadOptions}
          onChange={this.changeTags}
          noResultsText="Start typing"
          filterOptions={filterOptions(true, 'Suggest')}
        />

      </Dialog>
    );
  }

  open = () => this.setState({open: true});
  close = () => this.setState({
    open: false,
    tags: [],
    suggestion: null
  });

  loadOptions = () => {
    return Promise.all([
      getTags(TAG_TYPES.SKILL),
      getTags(TAG_TYPES.LOCATION),
      getTags(TAG_TYPES.COMMITMENT),
    ]).then(vals => ({options: vals[0].concat(vals[1]).concat(vals[2]) }));
  };
  changeTags = tags => {
    let entered = _.last(tags);
    if (!(entered && entered.create))
      return this.setState({tags});
    this.setState({
      suggestion: _.assign(entered, {
        label: entered.label.replace(/^Suggest /, ''),
        type: TAG_TYPES.SKILL
      })
    }, () => this.refs.suggest.focus() );
  };
  addSuggestion = body => {
    let {suggestion, tags} = this.state;
    _.assign(suggestion, body);
    this.setState({
      tags: tags.concat([suggestion]),
      suggestion: null
    });
  };

  _shouldSeedTags = () => {
    me().then(user => {
      if (_.isEmpty(user.tags) && !this._seedSkipped)
        this.open();
    });
  };

  _seedTags = () => {
    let tags = this.state.tags.map(t =>
      _.assign({text: t.label}, t.create ? {type: t.type, create: true} : {id: t.value}
    ));
    _fetch('user/seed-tags', {method:"POST", body: {tags}}).then(() => {
      this.close();
      this.props.onSeed();
    });
  };
}