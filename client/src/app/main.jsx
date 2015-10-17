import util from './lib/util';
import React from 'react';
import ReactDOM from 'react-dom';

const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');

import injectTapEventPlugin from 'react-tap-event-plugin';
import Routes from './routes.jsx';

//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

let Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getInitialState () {
    return {
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
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
    return Routes;
  }
})
ReactDOM.render(<Main/>, document.getElementById('app'));