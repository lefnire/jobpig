import React from 'react';
import {API_URL, _fetch} from '../helpers';
import mui from 'material-ui';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';

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
            <span style={{fontWeight:'bold', color:score>0 ? 'green' : 'red'}}>
              {obj.locked && <mui.FontIcon className="material-icons">lock_outline</mui.FontIcon>}
              {score>0 ? '+' : ''}{score}
            </span> {label}
          </div>
        }
        rightIconButton={
          <mui.IconMenu iconButtonElement={
            <mui.IconButton><MoreVertIcon /></mui.IconButton>
          }>
            <mui.MenuItem onTouchTap={()=>this.refs.dialog.show()}>Edit</mui.MenuItem>
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
    this.state = {profile:null};
    this._refresh();
  }

  render(){
    if (!this.state.profile) return null;
    let lockText = "Check to lock an attribute, meaning it won't be counted against in scoring";
    let p = this.state.profile;
    let linkedinUrl = `${API_URL}/auth/linkedin?token=${window.jwt}`;

    return (
      <mui.ClearFix>

        {p.linkedin_id ?
          <mui.Card>
            <mui.CardHeader title={p.fullname} avatar={p.pic} />
            <mui.CardText>
              <a href={p.linkedin_url}>LinkedIn Profile</a>
              <div>{p.bio}</div>
            </mui.CardText>
          </mui.Card>

          : <h1><a href={linkedinUrl} className='zocial linkedin'>Connect LinkedIn</a></h1>
        }

        <mui.List subheader="Search Preferences">
          <mui.ListItem
            primaryText="Remote Only"
            leftCheckbox={
              <mui.Checkbox onCheck={this._setPref.bind(this, 'remote_only')} defaultChecked={this.state.profile.remote_only} />
            }
            />
        </mui.List>

        <mui.Card>
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
                <mui.List>
                  {this.state.profile.user_companies.map(c =>
                    <Tag key={c.id} label={c.title} obj={c} id={c.id} table='user_companies' onUpdate={this._refresh}/>
                  )}
                </mui.List>
              </mui.Tab>

            </mui.Tabs>
          </mui.CardText>
        </mui.Card>
      </mui.ClearFix>
    )
  }

  _setPref = (pref, e, checked) => {
    _fetch(`user/preferences`, {method:"PUT", body:{
      [pref]: checked
    }})
  };

  _refresh = () => _fetch('user').then(profile => this.setState({profile}));
}
