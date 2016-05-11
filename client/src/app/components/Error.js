import React from 'react';
import _ from 'lodash';

export default class Error extends React.Component {
  render(){
    var {error} = this.props;
    if (!error) return null;
    let err = _.get(error, 'json.message')
      || _.get(error, 'response.statusText')
      || (error.toString && error.toString())
      || "An error occurred";
    return <div style={{color:'red'}}>{err}</div>;
  }
}