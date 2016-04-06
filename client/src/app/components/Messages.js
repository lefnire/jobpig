import React from 'react';
import MUI from 'material-ui';
import _ from 'lodash';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import {_fetch, me} from '../helpers';
import Footer from './Footer';
import { Colors } from 'material-ui/lib/styles';

class Reply extends React.Component {
  render() {
    let {sender, reply} = this.props;
    if (!reply) return null;
    return (
      <MUI.CardHeader
        title={sender.email}
        subtitle={reply.body}
        avatar={sender.pic} />
    );
  }
}

export default class Messages extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      user: {}
    };
    me().then(user => this.setState({user}));
    this.getMessages();
  }

  renderEmpty(){
    return (
      <div className="padded">
        <MUI.Card>
          <MUI.CardText>
            <p className="empty-text">
              Here you'll find messages when you've been contacted. Employers and searchers can contact each other via employer-posted jobs.
            </p>
          </MUI.CardText>
        </MUI.Card>
      </div>
    );
  }

  renderMessages(){
    return (
      <div>
        {this.state.messages.map(message => (
          <MUI.Card key={message.id} style={{margin:40}}>
            <MUI.CardTitle title={
              <span>
                {message.subject}
                {message.user_id !== this.state.user.id ? null :
                <MUI.IconButton iconClassName="material-icons" tooltip="You sent this">forward</MUI.IconButton>}
              </span>
            }/>
            <MUI.CardHeader
              title={message.users[message.user_id].email}
              subtitle={message.body}
              avatar={message.users[message.user_id].pic}
            />
            { message.replies && message.replies.map(reply => <Reply key={reply.id} sender={message.users[reply.user_id]} reply={reply} />) }
            <MUI.CardActions>
              <MUI.FlatButton label="Reply" onTouchTap={() => this.toggleReply(message)} />
              <MUI.FlatButton label="Delete" onTouchTap={() => this.remove(message)} />
            </MUI.CardActions>

            { message.showReply ?
              <MUI.Card style={{margin:20}}>
                <MUI.CardText>
                  <MUI.TextField
                    ref="response"
                    hintText="Reply to sender"
                    multiLine={true}
                    rows={2}
                  />
                </MUI.CardText>
                <MUI.CardActions>
                  <MUI.FlatButton label="Send" onTouchTap={() => this.send(message)} />
                  <MUI.FlatButton label="Cancel" onTouchTap={() => this.toggleReply(message)} />
                </MUI.CardActions>
              </MUI.Card>
              : null
            }

          </MUI.Card>
        ))}
      </div>
    );
  }

  render () {
    let isEmpty = this.state.messages.length === 0;
    return isEmpty ? this.renderEmpty() : this.renderMessages();
  }

  toggleReply = (message) => {
    message.showReply = !message.showReply;
    this.setState({});
  };

  getMessages = () => {
    _fetch('messages').then(messages=> {
      // Map [{id, email, fullname}] => {id: {id, email, fullname}}
      messages.forEach(msg => msg.users = _.zipObject(_.map(msg.users, 'id'), msg.users));
      this.setState({messages})
    });
  };

  remove = (message) => {
    _fetch(`messages/${message.id}`, {method: "DELETE"}).then(this.getMessages);
  };

  send = (message) => {
    let body = {body: this.refs.response.getValue()};
    _fetch(`messages/reply/${message.id}`, {method: "POST", body}).then(this.getMessages);
  };
}
