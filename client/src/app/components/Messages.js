import React from 'react';
import mui from 'material-ui';
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
      <mui.CardHeader
        title={sender.email}
        subtitle={reply.body}
        avatar={sender.pic} />
    );
  }
}
let styles = {
  footer: {
    backgroundColor: Colors.blueGrey500,
    textAlign: 'center',
    color: Colors.grey50,
    marginTop: 200
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
      <mui.Card style={{margin:40}}>
        <mui.CardText>
          <h1 style={{paddingBottom:10, borderBottom: '1px solid #eee'}}>Messages</h1>
          <p style={{padding:20, margin: 40, fontSize:"1.2em"}}>
            Here you'll find messages when you've been contacted. Employers and searchers can contact each other via employer-posted jobs.
          </p>
        </mui.CardText>
      </mui.Card>
    );
  }

  renderMessages(){
    return (
      <div>
        {this.state.messages.map(message => (
          <mui.Card key={message.id} style={{margin:40}}>
            <mui.CardTitle title={
              <span>
                {message.subject}
                {message.user_id !== this.state.user.id ? null :
                <mui.IconButton iconClassName="material-icons" tooltip="You sent this">forward</mui.IconButton>}
              </span>
            }/>
            <mui.CardHeader
              title={message.users[message.user_id].email}
              subtitle={message.body}
              avatar={message.users[message.user_id].pic}
            />
            { message.replies && message.replies.map(reply => <Reply key={reply.id} sender={message.users[reply.user_id]} reply={reply} />) }
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
