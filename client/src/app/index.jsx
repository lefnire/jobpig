// Custom
import { API_URL } from './actions';
import fetch from 'isomorphic-fetch';

// React
import React from 'react';
import ReactDOM from 'react-dom';

// Material UI
import {Mixins, Styles} from 'material-ui';
import injectTapEventPlugin from 'react-tap-event-plugin';
const { StylePropable } = Mixins;
const { Colors, Spacing, Typography } = Styles;
const ThemeManager = Styles.ThemeManager;
const DefaultRawTheme = Styles.LightRawTheme;
window.React = React; //Needed for React Developer Tools
//Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Redux
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
const store = configureStore();
import { ReduxRouter } from 'redux-router';

let Main = React.createClass({
  mixins: [StylePropable],

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getInitialState () {
    return {
      muiTheme: ThemeManager.getMuiTheme(DefaultRawTheme),
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.cyan700,
      primary1Color: Colors.blueGrey500
    });

    //ThemeManager.setComponentThemes({
    //  paper: {
    //    backgroundColor: Colors.blueGrey50,
    //  }
    //});

    this.setState({muiTheme: newMuiTheme});
  },

  render(){
    return <Provider store={store}>
      <ReduxRouter />
    </Provider>;
  }
});

ReactDOM.render(<Main/>, document.getElementById('app'));

{}// On initial page load, run cron on the server to refresh jobs (if it needs it). Better in a on-page-load than per request
// This doubles as "wake up, heroku!" which sleeps if not accessed for a while.
fetch(API_URL+'/jobs/cron');

// Setup google analytics, defer
window.setTimeout(function setupGoogleAnalytics(){
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create','<nconf:ga_tracking_id>', 'auto');
  ga('send', 'pageview');
});