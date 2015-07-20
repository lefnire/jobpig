import React from 'react/addons';
import injectTapEventPlugin from 'react-tap-event-plugin';
import routes from './routes.jsx';
import Router from 'react-router';

let {Route} = Router;

//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

Router.run(routes, Router.HashLocation, (Root) => {
  React.render(<Root/>, document.body);
});
