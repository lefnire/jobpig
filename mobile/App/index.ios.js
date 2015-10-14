'use strict';

let React = require('react-native');

let {
  Text,
  View,
  ListView,
  AsyncStorage,
  StyleSheet,
  TouchableHighlight
} = React;

let auth = require('./auth.ios');
let Job = require('./job.ios');

let Main = React.createClass({
  getInitialState(){
    return {loggedIn: false};
  },
  render() {
    return this.state.loggedIn ? <Job logout={this._logout} /> : <auth.Auth login={this._login} />;
  },
  _login(){
    this.setState({loggedIn: true});
  },
  _logout(){
    auth.logout().then( ()=> this.setState({loggedIn:false}) );
  }
});

let styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
});

module.exports = Main;