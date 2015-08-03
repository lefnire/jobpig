import React from 'react';
import request from 'superagent';
import mui from 'material-ui';

export default class Profile extends React.Component{
  constructor(){
    super();
    this.state = {profile:null};
    request.get('/user').end((err, res)=>{
      this.setState({profile:res.body});
    })
  }
  render(){
    if (!this.state.profile) return null;
    return (
      <mui.ClearFix>
        <h1>LinkedIn ID: {this.state.profile.linkedin}</h1>

        <mui.List subheader="Search Preferences">
          <mui.ListItem
            primaryText="Remote Only"
            leftCheckbox={
              <mui.Checkbox onCheck={this._setPref.bind(this, 'remote_only')} defaultChecked={this.state.profile.remote_only} />
            }
          />
        </mui.List>

        <mui.List subheader="Scores (check to lock a tag, meaning it won't be considered)">
          {this.state.profile.tags.map((t)=> {
            return <mui.ListItem
              primaryText={t.key+' ['+t.user_tags.score+']'}
              leftCheckbox={
                <mui.Checkbox onCheck={this._lock.bind(this, t)} defaultChecked={t.user_tags.locked} />
              }
              />
          })}
        </mui.List>
      </mui.ClearFix>
    )
  }
  _lock(tag, e, checked){
    request.post(`/user/tags/lock/${tag.id}`).end(()=>{});
  }
  _setPref(pref, e, checked){
    request.put(`/user/preferences`, {[pref]:checked}).end(()=>{});
  }
}