import React from 'react';
import _ from 'lodash';

export default class Error extends React.Component {
  render(){
    if (!this.props.error) return null;
    let err = _.get(this.props, 'error.json.message')
      || _.get(this.props, 'error.response.statusText')
      || (err.toString && err.toString())
      || "An error occurred";
    return <div style={{color:'red'}}>{err}</div>;
  }
}