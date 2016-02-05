import React from 'react';
import {Router, Route, Redirect, IndexRedirect} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front/front.jsx';
import Jobs from './components/jobs/jobs.jsx';
import Employer from './components/employer/employer.jsx';
import Profile from './components/profile.jsx';
import { loggedIn, logout } from './actions';

export default loggedIn() ? (
  <Route path="/"
   component={App}
   onUpdate={() => window.scrollTo(0, 0)} >
    <Route path="jobs/:filter" component={Jobs} />
    <Route path="employer" component={Employer} />
    <Route path="profile" component={Profile} />
    <Route path="logout" onEnter={logout} />
    <IndexRedirect to="jobs/inbox" />
    <Redirect path="*" to="jobs/inbox"/>
  </Route>
) : (
  <Route>
    <Route path="/" component={Front} />
    <Route path="logout" onEnter={logout} />
    <Redirect path="*" to="/" />
  </Route>
);
