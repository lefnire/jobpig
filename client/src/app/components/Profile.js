import React from 'react';
import {API_URL, _fetch, logout, isSmall, me} from '../helpers';
import {
  FlatButton,
  TextField,
  Checkbox,
  ListItem,
  FontIcon,
  IconMenu,
  IconButton,
  MenuItem,
  Card,
  CardHeader,
  CardText,
  CardTitle,
  List,
  RaisedButton,
} from 'material-ui';
import Formsy from 'formsy-react'
import {
  FormsyText
} from 'formsy-material-ui/lib';
import update from 'react-addons-update';
import SeedTags from './SeedTags';
import {
  Modal
} from 'react-bootstrap';

class DeleteAccount extends React.Component {
  constructor(){
    super();
    this.state = {open: false};
  }

  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  submit = body => {
    _fetch('user', {body, method: "DELETE"}).then(logout);
  };

  render(){
    const actions = [

    ];
    return (
      <Modal show={this.state.open} onHide={this.close} bsSize="large" animation={!isSmall}>
        <Modal.Header>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formsy.Form
            ref="form"
            onValid={() => this.setState({canSubmit: true})}
            onInvalid={() => this.setState({canSubmit: false})}
            onValidSubmit={this.submit}
          >
            <p>Confirm deletion by typing "DELETE" in the input below and submitting.</p>
            <FormsyText
              name='confirm'
              required
              fullWidth={true}
              validations="equals:DELETE"
              type="email"/>
          </Formsy.Form>
        </Modal.Body>
        <Modal.Footer>
          <FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>
          <FlatButton label="Delete" primary={true} disabled={false && !this.state.canSubmit} onTouchTap={() => this.refs.form.submit()}/>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default class TagEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {tag: null, open: false};
  }

  open = tag => this.setState({tag, open: true});
  close = () => this.setState({tag: null, open: false});

  render() {
    let {tag} = this.state;
    if (!tag) return null;
    let {locked, score} = tag.user_tags;
    return (
      <Modal show={this.state.open} onHide={this.close} bsSize="large" animation={!isSmall}>
        <Modal.Header><Modal.Title>Edit Tag</Modal.Title></Modal.Header>
        <Modal.Body>
          <TextField
            type='number'
            autofocus={true}
            fullWidth={true}
            value={score}
            onChange={this._changeScore}
            floatingLabelText="Manually enter a score"
          />
          <Checkbox
            label="Lock tag to score (won't be effected when thumbing)."
            onCheck={this._changeLock}
            checked={locked}
          />
        </Modal.Body>
        <Modal.Footer>
          <FlatButton label="Cancel" secondary={true} onTouchTap={this.close} />
          <FlatButton label="Submit" primary={true} onTouchTap={this._submit}/>
        </Modal.Footer>
      </Modal>
    );
  }

  _changeScore = e => this.setState(update(this.state, {
    tag: {user_tags: {score: {$set: e.target.value}}}
  }));

  _changeLock = e => {
    this.setState(update(this.state, {
      tag: {user_tags: {locked: {$set: e.target.checked}}}
    }))
  };

  _submit = () => {
    let {tag} = this.state;
    let {score, locked} = tag.user_tags;
    _fetch(`user/tags/${tag.id}`, {method:"PUT", body: {score, locked}})
      .then(json => {
        this.close();
        this.props.onSubmit();
      });
  };
}

export default class Profile extends React.Component{
  constructor(){
    super();
    this.state = {
      profile: {
        tags: [],
      },
      canSubmit: false
    };
    this._refresh();
  }

  //<Tag key={t.id} label={t.key} tag={t.user_tags} id={t.id} onUpdate={this._refresh}/>
  renderTag = tag => {
    let {score, locked} = tag.user_tags;
    return (
      <ListItem key={tag.id}
        primaryText={(
          <div>
            <span style={{fontWeight:'bold', color: score > 0 ? 'green' : 'red'}}>
              {locked && <FontIcon className="material-icons">lock_outline</FontIcon>}
              {score > 0 ? '+' : ''}{score}
            </span> {tag.text}
          </div>
        )}
        rightIconButton={(
          <IconMenu iconButtonElement={
            <IconButton><FontIcon className="material-icons">more_vert</FontIcon></IconButton>
          }>
            <MenuItem onTouchTap={() => this.refs.dialog.open(tag)}>Edit</MenuItem>
            <MenuItem onTouchTap={() => this._removeTag(tag.id)}>Remove</MenuItem>
          </IconMenu>
        )}
      />
    );
  }

  render(){
    let {profile} = this.state;
    if (!profile) return null;
    let isUrl = "Must be a url";
    let tags = this.state.profile.tags;

    return (
      <div>

        <TagEdit selected={this.state.selected} ref="dialog" onSubmit={this._refresh} />
        <SeedTags onSeed={this._refresh} ref="seed" />

        <Card>
          <CardHeader avatar={profile.pic} />
          <CardText>

            <Formsy.Form
              ref="form"
              onValid={() => this.setState({canSubmit: true})}
              onInvalid={() => this.setState({canSubmit: false})}
              onValidSubmit={this._submitProfile}>

              <FormsyText name='fullname' required hintText="Full Name" value={profile.fullname} fullWidth={true}/>
              <FormsyText name='pic' hintText="Photo URL" value={profile.pic} fullWidth={true} validations="isUrl" validationError={isUrl} />
              <FormsyText name='linkedin_url' hintText="LinkedIn URL" value={profile.linkedin_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <FormsyText name='github_url' hintText="Github URL" value={profile.github_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <FormsyText name='twitter_url' hintText="Twitter URL" value={profile.twitter_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <FormsyText name='bio' hintText="Bio" value={profile.bio} fullWidth={true} multiLine={true} rows={3}/>

              <RaisedButton label="Save" primary={true} type='submit' disabled={false && !this.state.canSubmit} />
              <a className="destroy-link" onClick={()=>this.refs.delete.open()}>Delete account</a>

            </Formsy.Form>
          </CardText>
        </Card>

        <Card>
          <CardTitle title='Scores' subtitle="Check to lock an attribute, meaning it won't be counted against in scoring" />
          <CardText>
            <List>
              {tags.length ? tags.map(this.renderTag) : (
                <ListItem primaryText={(
                  <div>No tag scores yet, click below head to <a href="/#/match">matches</a>.</div>
                )} />
              )}
            </List>
            <RaisedButton label="Seed More Tags" onTouchTap={this._seedTags} />
            <a className="destroy-link" onClick={this._reset}>Reset Tags</a>
          </CardText>
        </Card>

        <DeleteAccount ref="delete" />
      </div>
    )
  }

  _refresh = () => me(true).then(profile => this.setState({profile}));

  _submitProfile = (body) => {
    _fetch(`user`, {method: "PUT", body})
      .then(profile => {
        this.setState({profile});
        global.jobpig.alerts.alert("Profile saved.")
      })
      .catch(global.jobpig.alerts.alert);
  };

  _removeTag = id => {
    _fetch(`user/tags/${id}`, {method:"DELETE"}).then(this._refresh);
  };

  _reset = () => {
    if (!confirm('Are you sure you want to delete all your scores?'))
      return;
    _fetch('user/tags/reset', {method: "POST"}).then(this._refresh);
  };

  _seedTags = () => this.refs.seed.open();

}
