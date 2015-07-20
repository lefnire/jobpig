import React from 'react';
import {Route,DefaultRoute} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front.jsx';
import Jobs from './components/jobs/jobs.jsx';
import Prospects from './components/prospects.jsx';
import Profile from './components/profile.jsx';

export default window.user ? (
  <Route path="/" handler={App} >
    <Route path="jobs/:filter" name='jobs' handler={Jobs} />
    <Route path="prospects" name='prospects' handler={Prospects} />
    <Route path="profile" name='profile' handler={Profile} />
    <DefaultRoute handler={Jobs}/>
  </Route>
) : (
  <Route path="/" handler={App} >
    <Route path="front" name='front' handler={Front} />
    <DefaultRoute handler={Front}/>
  </Route>
);
