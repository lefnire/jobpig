'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  NavigatorIOS,
} = React;

var AppView = require('./App/index.ios.js');

var Jobpig = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.container}
        tintColor='#FF6600'
        initialRoute={{
          title: 'Jobpig',
          component: AppView,
        }}/>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6EF',
  },
});

AppRegistry.registerComponent('Jobpig', () => Jobpig);

module.exports = Jobpig;