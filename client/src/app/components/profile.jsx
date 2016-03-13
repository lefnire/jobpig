import React from 'react';
import {API_URL, _fetch} from '../helpers';
import mui from 'material-ui';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';

class Tag extends React.Component {
  // key,score,id,table
  render(){
    let {label,obj,id} = this.props;
    let {score} = obj;
    return <div>
      <mui.ListItem
        key={id}
        primaryText={
          <div>
            <span style={{fontWeight:'bold', color: score > 0 ? 'green' : 'red'}}>
              {obj.locked && <mui.FontIcon className="material-icons">lock_outline</mui.FontIcon>}
              {score > 0 ? '+' : ''}{score}
            </span> {label}
          </div>
        }
        rightIconButton={
          <mui.IconMenu iconButtonElement={
            <mui.IconButton><MoreVertIcon /></mui.IconButton>
          }>
            <mui.MenuItem onTouchTap={() => this.refs.dialog.show()}>Edit</mui.MenuItem>
            <mui.MenuItem onTouchTap={this._remove}>Remove</mui.MenuItem>
          </mui.IconMenu>
        } />

        <mui.Dialog title="Edit Tag" ref="dialog" actions={[
            {text: 'Cancel'},
            {text: 'Submit', onTouchTap:this._submit, ref: 'submit'}
          ]} >
          <mui.TextField ref='score' type='number' autofocus={true} fullWidth={true} defaultValue={score} floatingLabelText="Manually enter a score" />
          <mui.Checkbox ref='lock' label="Lock tag to score (won't be effected when thumbing)." defaultChecked={obj.locked} />
      </mui.Dialog>
    </div>;
  }

  _submit = () => {
    _fetch(`user/${this.props.table}/${this.props.id}`, {method:"PUT", body:{
      score: this.refs.score.getValue(),
      lock: this.refs.lock.isChecked()
    }})
    .then(json => {
      this.refs.dialog.dismiss();
      this.props.onUpdate();
    });
  }

  _remove = () => {
    _fetch(`user/${this.props.table}/${this.props.id}`, {method:"DELETE"})
      .then(()=> this.props.onUpdate() );
  }
}

export default class Profile extends React.Component{
  constructor(){
    super();
    this.state = {
      profile: {
        tags: [],
        user_companies: []
      },
      canSubmit: false
    };
    this._refresh();
  }

  render(){
    if (!this.state.profile) return null;
    let lockText = "Check to lock an attribute, meaning it won't be counted against in scoring";
    let {profile} = this.state;

    let isUrl = "Must be a url";

    return (
      <mui.ClearFix>

        <mui.Card>
          <mui.CardHeader avatar={profile.pic} />
          <mui.CardText>

            <Formsy.Form
              ref="form"
              onValid={() => this.setState({canSubmit: true})}
              onInvalid={() => this.setState({canSubmit: false})}
              onValidSubmit={this.submitForm}>

              <fui.FormsyText name='fullname' required hintText="Full Name" value={profile.fullname} fullWidth={true}/>
              <fui.FormsyText name='pic' hintText="Photo URL" value={profile.pic} fullWidth={true} validations="isUrl" validationError={isUrl} />
              <fui.FormsyText name='linkedin_url' hintText="LinkedIn URL" value={profile.linkedin_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <fui.FormsyText name='github_url' hintText="Github URL" value={profile.github_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <fui.FormsyText name='twitter_url' hintText="Twitter URL" value={profile.twitter_url} fullWidth={true} validations="isUrl" validationError={isUrl}/>
              <fui.FormsyText name='bio' hintText="Bio" value={profile.bio} fullWidth={true} multiLine={true} rows={3}/>

              <mui.RaisedButton label="Save" primary={true} type='submit' disabled={!this.state.canSubmit} />

            </Formsy.Form>
          </mui.CardText>
        </mui.Card>

        {/*<mui.Card>
          <mui.CardTitle title='Scores' subtitle={lockText}/>
          <mui.CardText>
            <mui.Tabs>
              <mui.Tab label="Tags" >
                <mui.List>
                  {this.state.profile.tags.map(t =>
                    <Tag key={t.id} label={t.key} obj={t.user_tags} id={t.id} table='user_tags' onUpdate={this._refresh}/>
                  )}
                </mui.List>
              </mui.Tab>

              <mui.Tab label="Companies" >
                <mui.List ref="whatever">
                  {this.state.profile.user_companies.map(c =>
                    <Tag key={c.id} label={c.title} obj={c} id={c.id} table='user_companies' onUpdate={this._refresh}/>
                  )}
                </mui.List>
              </mui.Tab>

            </mui.Tabs>
          </mui.CardText>
        </mui.Card>*/}
      </mui.ClearFix>
    )
  }

  _setPref = (pref, e, checked) => {
    _fetch(`user/preferences`, {method:"PUT", body:{
      [pref]: checked
    }})
  };

  _refresh = () => _fetch('user').then(profile => this.setState({profile}));

  submitForm = (body) => {
    _fetch(`user/preferences`, {method: "PUT", body})
      .then(() => global._alerts.alert("Profile saved."))
      .catch(json => global._alerts.alert(json.json.message));
  };
}
