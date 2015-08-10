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
    var lockText = "Check to lock an attribute, meaning it won't be counted against in scoring";
    var p = this.state.profile;
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

          : <h1><a href='/auth/linkedin' className='zocial linkedin'>Connect LinkedIn</a></h1>
        }

        <mui.List subheader="Search Preferences">
          <mui.ListItem
            primaryText="Remote Only"
            leftCheckbox={
              <mui.Checkbox onCheck={this._setPref.bind(this, 'remote_only')} defaultChecked={this.state.profile.remote_only} />
            }
            />
        </mui.List>

        <h2>Scores</h2>
        <mui.Tabs>
          <mui.Tab label="Tags" >
            <mui.List subheader={lockText}>
              {this.state.profile.tags.map((t)=> {
                return <mui.ListItem
                  primaryText={t.key+' ['+t.user_tags.score+']'}
                  leftCheckbox={
                    <mui.Checkbox onCheck={this._lock.bind(this, 'user_tags', t)} defaultChecked={t.user_tags.locked} />
                  }
                  />
              })}
            </mui.List>
          </mui.Tab>

          <mui.Tab label="Companies" >
            <mui.List subheader={lockText}>
              {this.state.profile.user_companies.map((c)=> {
                return <mui.ListItem
                  primaryText={c.title+' ['+c.score+']'}
                  leftCheckbox={
                    <mui.Checkbox onCheck={this._lock.bind(this, 'user_companies', c)} defaultChecked={c.locked} />
                  }
                  />
              })}
              </mui.List>
          </mui.Tab>
        </mui.Tabs>

      </mui.ClearFix>
    )
  }
  _lock(table, obj, e, checked){
    request.post(`/user/lock/${table}/${obj.id}`).end(()=>{});
  }
  _setPref(pref, e, checked){
    request.put(`/user/preferences`, {[pref]:checked}).end(()=>{});
  }
}