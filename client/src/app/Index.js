require('es6-promise').polyfill();
require("../www/main.pcss");
require("../../../node_modules/react-select/dist/react-select.min.css");

// Custom
import {API_URL, setupGoogle, _ga} from './helpers';
setupGoogle();

// React
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

// Material UI
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin(); //Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
window.React = React; //Needed for React Developer Tools
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// React-Router
import {Router, Route, Redirect, IndexRedirect, hashHistory} from 'react-router';
import Alerts from './components/Alerts';
import App from './components/App';
import Front from './components/front/Front';
import ResetPassword from './components/front/ResetPassword';
import Jobs from './components/jobs/Jobs';
import JobView from './components/front/JobView';
import Employer from './components/employer/Employer';
import Messages from './components/Messages'
import Profile from './components/Profile';
import {loggedIn, logout} from './helpers';

const myTheme = getMuiTheme({
  palette: {
    accent1Color: '#414b82',
    primary1Color: '#272d4e'
  }
});

class Main extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={myTheme}>
        <div>
          <Alerts ref={c => global.jobpig.alerts = c} />
          <Router history={hashHistory} onUpdate={this.onUpdate}>
            {loggedIn() ? (
              <Route path="/"
                component={App}
                onUpdate={() => window.scrollTo(0, 0)}
              >
                <Route path="jobs/:filter" component={Jobs} />
                <Route path="job/:id" component={JobView} />
                <Route path="employer" component={Employer} />
                <Route path="profile" component={Profile} />
                <Route path="logout" onEnter={logout} />
                <Route path="messages" component={Messages} />
                <IndexRedirect to="jobs/match" />
                <Redirect path="*" to="jobs/match"/>
              </Route>
            ) : (
              <Route onEnter={this.onEnter}>
                <Route path="/(employer)" component={Front} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route path="/job/:id" component={JobView} />
                <Redirect path="*" to="/" />
              </Route>
            )}
          </Router>
        </div>
      </MuiThemeProvider>
    );
  }

  onUpdate = () => {
    // FIXME this.state is always null at this point, what's going on?
    // this.refs.flash.onRoute(this.state.location)
    _ga.pageview();
    let query = _.fromPairs(window.location.search.slice(1).split('&').map(i => i.split('=')));
    global.jobpig.alerts.flash({query});
  };
};

ReactDOM.render(<Main/>, document.getElementById('app'));