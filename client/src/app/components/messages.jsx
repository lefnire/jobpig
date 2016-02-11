import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import {_fetch} from '../helpers';

export default class Messages extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: []
    };
    this.getMessages();
  }

  render () {
    return (
      <mui.Card style={{margin:40}}>
        <mui.CardText>
          {this.state.messages.map(m => (
            <div>
              <h2>{m.subject}</h2>
              <p>{m.body}</p>
              <hr/>
            </div>
          ))}
        </mui.CardText>
      </mui.Card>
    );
  }

  getMessages = () => {
    _fetch('user/messages').then(messages => this.setState({messages}));
  }
}
