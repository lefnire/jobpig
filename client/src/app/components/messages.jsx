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

    let styles = {
      card: {margin:40}
    };
    return (
      <div>
        {this.state.messages.map(message => (
          <mui.Card style={styles.card}>
            <mui.CardHeader
              title={message.employer || 'Anonymous Employer'}
              subtitle={message.company || 'Anonymous Company'}
              avatar="http://lorempixel.com/100/100/nature/"
            />
            <mui.CardTitle title={message.subject} />
            <mui.CardText>
              <p>{message.body}</p>
            </mui.CardText>
            <mui.CardActions>
              <mui.FlatButton label="Reply" onTouchTap={() => this.toggleReply(message)} />
              <mui.FlatButton label="Delete" onTouchTap={() => this.remove(message)} />
            </mui.CardActions>

            { message.showReply ?
              <mui.Card>
                <mui.CardText>
                  <mui.TextField
                    hintText="Reply to sender"
                    multiLine={true}
                    rows={2}
                  />
                </mui.CardText>
                <mui.CardActions>
                  <mui.FlatButton label="Send" onTouchTap={() => this.send(message)} />
                  <mui.FlatButton label="Cancel" onTouchTap={() => this.toggleReply(message)} />
                </mui.CardActions>
              </mui.Card>
              : null
            }

          </mui.Card>
        ))}
      </div>
    );
  }

  toggleReply = (message) => {
    message.showReply = !message.showReply;
    this.setState({});
  }

  getMessages = () => {
    _fetch('messages').then(messages => this.setState({messages}));
  }

  remove = (message) => {
    //_.pull(this.state.messages, message);
    //this.setState({});
    _fetch('messages/'+message.id, {method: "DELETE"})
  };

  send = (response) => {
    _fetch('messages', {method: "POST", body: response})
  };
}
