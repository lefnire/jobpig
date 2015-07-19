import React from 'react/addons';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Jobs from './components/jobs.jsx'; // Our custom react component
import mui from 'material-ui';

let ThemeManager = new mui.Styles.ThemeManager();
let {Colors} = mui.Styles;

//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Render the main app react component into the document body.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
let Main = React.createClass({
  componentWillMount() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },
  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  render(){
    return <Jobs />
  }
});
React.render(<Main />, document.body);