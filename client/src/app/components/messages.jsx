import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';

export default class Messages extends React.Component{
  render () {
    return (
      <mui.Card style={{margin:40}}>
        <mui.CardText>
    <h1 style={{paddingBottom:10, borderBottom: '1px solid #eee'}}>This is a place for your stupid messages.</h1>
    <ul style={{fontSize:"1.2em", marginTop: 50}}>
    <li>You can send and recieve messages from prospective employers here.</li>
    <li>Employers: You can send and recieve messages from future employees here!</li>
    <li style={{paddingBottom: 30}}>And they all lived happily ever after.</li>
     </ul>
    </mui.CardText>
  </mui.Card>
  )
  }
}
