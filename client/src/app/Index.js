require("../www/main.scss");
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
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ThemeDecorator from 'material-ui/lib/styles/theme-decorator';

// React-Router
import {Router, Route, Redirect, IndexRedirect, hashHistory} from 'react-router';
import Alerts from './components/Alerts';
import App from './components/App';
import Front from './components/front/Front';
import ResetPassword from './components/front/ResetPassword';
import Jobs from './components/jobs/Jobs';
import Employer from './components/employer/Employer';
import Messages from './components/Messages'
import Profile from './components/Profile';
import {loggedIn, logout} from './helpers';

const myTheme = {
  palette: {
    accent1Color: '#414B82',
    primary1Color: '#272D4E'
  }
};

@ThemeDecorator(ThemeManager.getMuiTheme(myTheme))
class Main extends Component {
  render() {
    return (
      <div>
        <Alerts ref={c => global.jobpig.alerts = c} />
        <Router history={hashHistory} onUpdate={this.onUpdate}>
          {loggedIn() ? (
            <Route path="/"
              component={App}
              onUpdate={() => window.scrollTo(0, 0)}
            >
              <Route path="jobs/:filter" component={Jobs} />
              <Route path="employer" component={Employer} />
              <Route path="profile" component={Profile} />
              <Route path="logout" onEnter={logout} />
              <Route path="messages" component={Messages} />
              <IndexRedirect to="jobs/match" />
              <Redirect path="*" to="jobs/match"/>
            </Route>
          ) : (
            <Route onEnter={this.onEnter}>
              <Route path="/" component={Front} />
              <Route path="/reset-password" component={ResetPassword} />
              <Redirect path="*" to="/" />
            </Route>
          )}
        </Router>
      </div>
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