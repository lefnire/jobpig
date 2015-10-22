import util from './lib/util';
import React from 'react';
import ReactDOM from 'react-dom';
import {Mixins, Styles} from 'material-ui';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Routes from './routes.jsx';

const { StylePropable } = Mixins;
const { Colors, Spacing, Typography } = Styles;
const ThemeManager = Styles.ThemeManager;
const DefaultRawTheme = Styles.LightRawTheme;

//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

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
    return Routes;
  }
})
ReactDOM.render(<Main/>, document.getElementById('app'));