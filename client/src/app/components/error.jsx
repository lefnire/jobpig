import React from 'react';
import _ from 'lodash';

export default class Error extends React.Component {
  render(){
    if (!this.props.error) return null;
    let err = this.props.error.json.message || this.props.error.response.statusText;
    return <div style={{color:'red'}}>{err}</div>;
  }
}