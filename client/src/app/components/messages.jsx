import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import {_fetch} from '../helpers';

export default class Messages extends React.Component {
  constructor() {
    super();
    this.state = {messages: []};
    this.getMessages();
  }

  shouldComponentUpdate(nextProps, nextState){
    //FIXME nextState has message updated with responses, but since they're nested in an array React isn't catching
    // and object diff. This is bad performance; possibly break replies out to separate component?
    return true;
  }

  renderReply = (users, reply) => {
    if (!reply) return null;
    let user = _.find(users, {id: reply.user_id});
    return (
      <div key={reply.id}>
        <hr/>
        {user.email} says {reply.body}
      </div>
    );
  }

  render () {
    return (
      <div>
        {this.state.messages.map(message => (
          <mui.Card style={{margin:40}}>
            <mui.CardTitle title={message.subject} />
            <mui.CardHeader
              title={_.find(message.users, {id: message.user_id}).email}
              avatar="http://lorempixel.com/100/100/nature/"
            />
            <mui.CardText>
              <div>{message.body}</div>
              {message.replies.map(reply => this.renderReply(message.users, reply))}
            </mui.CardText>
            <mui.CardActions>
              <mui.FlatButton label="Reply" onTouchTap={() => this.toggleReply(message)} />
              <mui.FlatButton label="Delete" onTouchTap={() => this.remove(message)} />
            </mui.CardActions>

            { message.showReply ?
              <mui.Card style={{margin:20}}>
                <mui.CardText>
                  <mui.TextField
                    ref="response"
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
  };

  getMessages = () => {
    _fetch('messages').then(messages=> this.setState({messages}));
  };

  remove = (message) => {
    _fetch(`messages/${message.id}`, {method: "DELETE"}).then(this.getMessages);
  };

  send = (message) => {
    let body = {body: this.refs.response.getValue()};
    _fetch(`messages/reply/${message.id}`, {method: "POST", body}).then(this.getMessages);
  };
}
