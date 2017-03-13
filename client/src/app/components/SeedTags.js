import React, {Component} from 'react';
import update from 'react-addons-update';
import {
  FlatButton,
  MenuItem,
  RaisedButton,
  Card,
  CardTitle,
  CardText,
  TextField
} from 'material-ui';
import Formsy from 'formsy-react'
import {
  FormsyText,
  FormsySelect
} from 'formsy-material-ui/lib';
import _ from 'lodash';
import {_fetch, getTags, me, constants, filterOptions, IS_SMALL} from '../helpers';
import Select from 'react-select';
const {TAG_TYPES} = constants;
import {
  Modal
} from 'react-bootstrap';

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
    let {open, tags} = this.state;
    let modal = !this.props.noModal;

    let content = (
      <div>
        <Modal.Header>
          <Modal.Title>Seed Tags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You'll be thumbing your way to matches soon, but let's kickstart with a few must-haves. Enter a comma-delimited list of keywords, such as <b>python,san francisco,full-time,remote"</b>.</p>
          <TextField
            ref="tags"
            hintText="Add personal comments here."
            fullWidth={true}
            multiLine={true} />
        </Modal.Body>

        <Modal.Footer>
          {modal && <FlatButton
            label="Skip"
            secondary={true}
            onTouchTap={() => {
              this._seedSkipped=true;
              this.close();
            }}
          />}
          <FlatButton label="Submit" primary={true} onTouchTap={this._seedTags} />
        </Modal.Footer>
      </div>
    );
    return modal ? (
      <Modal show={open} onHide={this.close} bsSize="large" animation={!IS_SMALL}>
        {content}
      </Modal>
    ) : content;
  }

  open = () => this.setState({open: true});
  close = () => this.setState({
    open: false,
    tags: [],
  });

  _shouldSeedTags = () => {
    me().then(user => {
      if (_.isEmpty(user.tags) && !this._seedSkipped)
        this.open();
    });
  };

  _seedTags = () => {
    let tags = this.refs.tags.getValue();
    _fetch('user/seed-tags2', {method:"POST", body: {tags}}).then(res => {
      this.close();
      this.props.onSeed(res);
    });
  };
}