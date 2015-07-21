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
    console.dir(this.state.profile);
    return (
      <mui.ClearFix>
        <h1>LinkedIn ID: {this.state.profile.linkedin}</h1>
        <mui.List>
          {this.state.profile.tags.map((t)=> {
            return <mui.ListItem primaryText={t.text+' ['+t.user_tags.score+']'}/>
          })}
        </mui.List>
      </mui.ClearFix>
    )
  }
}