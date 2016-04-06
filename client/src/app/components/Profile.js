import React from 'react';
import {API_URL, _fetch, logout} from '../helpers';
import MUI from 'material-ui';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import update from 'react-addons-update';
import SeedTags from './jobs/SeedTags';

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
      <MUI.FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>,
      <MUI.FlatButton label="Delete" primary={true} disabled={!this.state.canSubmit} onTouchTap={() => this.refs.form.submit() }
      />,
    ];
    return (
      <MUI.Dialog
        title="Delete account"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.close}
      >
        <Formsy.Form
          ref="form"
          onValid={() => this.setState({canSubmit: true})}
          onInvalid={() => this.setState({canSubmit: false})}
          onValidSubmit={this.submit}
        >
          <p>Confirm deletion by typing "DELETE" in the input below and submitting.</p>
          <fui.FormsyText
            name='confirm'
            required
            fullWidth={true}
            validations="equals:DELETE"
            type="email"/>
        </Formsy.Form>
      </MUI.Dialog>
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
    let actions = [
      <MUI.FlatButton label="Cancel" secondary={true} onTouchTap={this.close} />,
      <MUI.FlatButton label="Submit" primary={true} keyboardFocused={true} onTouchTap={this._submit}/>,
    ];
    //modal={false}
    return (
      <MUI.Dialog title="Edit Tag" actions={actions} open={this.state.open} onRequestClose={this.close}>
        <MUI.TextField
          type='number'
          autofocus={true}
          fullWidth={true}
          value={score}
          onChange={this._changeScore}
          floatingLabelText="Manually enter a score"
        />
        <MUI.Checkbox
          label="Lock tag to score (won't be effected when thumbing)."
          onCheck={this._changeLock}
          checked={locked}
        />
      </MUI.Dialog>
    );
  }

  _changeScore = e => this.setState(update(this.state, {
    tag: {user_tags: {score: {$set: e.target.value}}}
  }));

  _changeLock = e => {
    debugger;
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
      <MUI.ListItem key={tag.id}
        primaryText={(
          <div>
            <span style={{fontWeight:'bold', color: score > 0 ? 'green' : 'red'}}>
              {locked && <MUI.FontIcon className="material-icons">lock_outline</MUI.FontIcon>}
              {score > 0 ? '+' : ''}{score}
            </span> {tag.text}
          </div>
        )}
        rightIconButton={(
          <MUI.IconMenu iconButtonElement={
            <MUI.IconButton><MoreVertIcon /></MUI.IconButton>
          }>
            <MUI.MenuItem onTouchTap={() => this.refs.dialog.open(tag)}>Edit</MUI.MenuItem>
            <MUI.MenuItem onTouchTap={() => this._removeTag(tag.id)}>Remove</MUI.MenuItem>
          </MUI.IconMenu>
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
      <MUI.ClearFix>

        <TagEdit selected={this.state.selected} ref="dialog" onSubmit={this._refresh} />
        <SeedTags onSeed={this._refresh} ref="seed" />

        <MUI.Card>
          <MUI.CardHeader avatar={profile.pic} />
          <MUI.CardText>

            <Formsy.Form
              ref="form"
              onValid={() => this.setState({canSubmit: true})}
              onInvalid={() => this.setState({canSubmit: false})}
              onValidSubmit={this._submitProfile}>

              <fui.FormsyText name='fullname' required hintText="Full Name" value={profile.fullname} fullWidth={true}/>
              <fui.FormsyText name='pic' hintText="Photo URL" value={profile.pic} fullWidth={true} validations="isUrl" validationError={isUrl} />
              <fui.FormsyText name='linkedin_url' hintText="LinkedIn URL" value={profile.linkedin_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <fui.FormsyText name='github_url' hintText="Github URL" value={profile.github_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <fui.FormsyText name='twitter_url' hintText="Twitter URL" value={profile.twitter_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <fui.FormsyText name='bio' hintText="Bio" value={profile.bio} fullWidth={true} multiLine={true} rows={3}/>

              <MUI.RaisedButton label="Save" primary={true} type='submit' disabled={!this.state.canSubmit} />
              <a style={{cursor:'pointer', color: 'red', marginLeft: 15}} onClick={()=>this.refs.delete.open()}>Delete account</a>

            </Formsy.Form>
          </MUI.CardText>
        </MUI.Card>

        <MUI.Card>
          <MUI.CardTitle title='Scores' subtitle="Check to lock an attribute, meaning it won't be counted against in scoring" />
          <MUI.CardText>
            <MUI.List>
              {tags.length ? tags.map(this.renderTag) : (
                <MUI.ListItem primaryText={(
                  <div>No tag scores yet, click below head to <a href="/#/match">matches</a>.</div>
                )} />
              )}
            </MUI.List>
            <MUI.RaisedButton label="Seed More Tags" onTouchTap={this._seedTags} />
          </MUI.CardText>
        </MUI.Card>

        <DeleteAccount ref="delete" />
      </MUI.ClearFix>
    )
  }

  _refresh = () => _fetch('user').then(profile => this.setState({profile}));

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

  _seedTags = () => this.refs.seed.open();

}
