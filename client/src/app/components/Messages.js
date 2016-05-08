import React from 'react';
import {
  CardHeader,
  Card,
  CardText,
  CardTitle,
  IconButton,
  CardActions,
  FlatButton,
} from 'material-ui';
import _ from 'lodash';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui/lib';
import {_fetch, me} from '../helpers';
import Footer from './Footer';

class Reply extends React.Component {
  render() {
    let {sender, reply} = this.props;
    if (!reply) return null;
    return (
      <CardHeader
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
        <Card>
          <CardText>
            <p className="empty-text">
              Here you'll find messages when you've been contacted. Employers and searchers can contact each other via employer-posted jobs.
            </p>
          </CardText>
        </Card>
      </div>
    );
  }

  renderMessages(){
    return (
      <div>
        {this.state.messages.map(message => (
          <Card key={message.id} style={{margin:40}}>
            <CardTitle title={
              <span>
                {message.subject}
                {message.user_id !== this.state.user.id ? null :
                <IconButton iconClassName="material-icons" title="You sent this">forward</IconButton>}
              </span>
            }/>
            <CardHeader
              title={message.users[message.user_id].email}
              subtitle={message.body}
              avatar={message.users[message.user_id].pic}
            />
            { message.replies && message.replies.map(reply => <Reply key={reply.id} sender={message.users[reply.user_id]} reply={reply} />) }
            <CardActions>
              <FlatButton label="Reply" onTouchTap={() => this.toggleReply(message)} />
              <FlatButton label="Delete" onTouchTap={() => this.remove(message)} />
            </CardActions>

            { message.showReply ?
              <Card style={{margin:20}}>
                <CardText>
                  <TextField
                    ref="response"
                    hintText="Reply to sender"
                    multiLine={true}
                    rows={2}
                  />
                </CardText>
                <CardActions>
                  <FlatButton label="Send" onTouchTap={() => this.send(message)} />
                  <FlatButton label="Cancel" onTouchTap={() => this.toggleReply(message)} />
                </CardActions>
              </Card>
              : null
            }

          </Card>
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
