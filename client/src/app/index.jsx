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

// Custom
import util from './util';

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