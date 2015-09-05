import React from 'react';
import util from './lib/util'
import {Route,Redirect} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front/front.jsx';
import Jobs from './components/jobs/jobs.jsx';
import MyPosts from './components/myPosts.jsx';
import Profile from './components/profile.jsx';

export default window.jwt ? (
  <Route path='/' name='root' handler={App} >
    <Route path="jobs/:filter" name='jobs' handler={Jobs} />
    <Route path="my-posts" name='my-posts' handler={MyPosts} />
    <Route path="profile" name='profile' handler={Profile} />
    <Redirect to="jobs" params={{filter: 'inbox'}} />
  </Route>
) : (
  <Route>
    <Route path='/' name='root' handler={Front} />
    <Redirect to="/" />
  </Route>
);
