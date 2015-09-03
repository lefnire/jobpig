import util from './lib/util';
import React from 'react/addons';
import injectTapEventPlugin from 'react-tap-event-plugin';
import routes from './routes.jsx';
import Router from 'react-router';
var {Route} = Router;

import mui from 'material-ui';
var {RouteHandler} = Router;
var ThemeManager = new mui.Styles.ThemeManager();
var {Colors} = mui.Styles;


//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

Router.run(routes, Router.HashLocation, (Root) => {
  var Main = React.createClass({
    componentWillMount() {
      ThemeManager.setPalette({
        accent1Color: Colors.deepOrange500,
        primary1Color: Colors.blueGrey500
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
      return <Root/>;
    }
  })
  React.render(<Main/>, document.body);
});
