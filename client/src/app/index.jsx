require("../www/main.css");
require("../../../node_modules/react-select/dist/react-select.min.css");

// Custom
import {API_URL} from './helpers';
import fetch from 'isomorphic-fetch';
import Alerts from './components/alerts';
import url from 'url';

// React
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

// Material UI
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin(); //Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
window.React = React; //Needed for React Developer Tools
import {Colors} from 'material-ui/lib/styles';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ThemeDecorator from 'material-ui/lib/styles/theme-decorator';

// React-Router
import {Router, Route, Redirect, IndexRedirect, hashHistory} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front/front.jsx';
import ResetPassword from './components/front/reset-password.jsx';
import Jobs from './components/jobs/jobs.jsx';
import Employer from './components/employer/employer.jsx';
import Messages from './components/messages.jsx'
import Profile from './components/profile.jsx';
import {loggedIn, logout} from './helpers';

const myTheme = {
  palette: {
    accent1Color: Colors.cyan700,
    primary1Color: Colors.blueGrey500
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
              <Route path="logout" />
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
    let query = _.fromPairs(window.location.search.slice(1).split('&').map(i => i.split('=')));
    global.jobpig.alerts.flash({query});
  };
};

ReactDOM.render(<Main/>, document.getElementById('app'));

// On initial page load, run cron on the server to refresh jobs (if it needs it). Better in a on-page-load than per request
// This doubles as "wake up, heroku!" which sleeps if not accessed for a while.
fetch(API_URL + '/jobs/cron');

// Setup google analytics, defer
window.setTimeout(function setupGoogleAnalytics(){
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create','<nconf:ga_tracking_id>', 'auto');
  ga('send', 'pageview');
});
