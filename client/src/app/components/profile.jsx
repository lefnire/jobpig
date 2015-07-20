import React from 'react';

export default class Profile extends React.Component{
  render(){
    return (<div>{window.user}</div>);
  }
}