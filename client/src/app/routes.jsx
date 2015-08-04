import React from 'react';
import {Route,DefaultRoute} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front.jsx';
import Jobs from './components/jobs/jobs.jsx';
import MyPosts from './components/myPosts.jsx';
import Profile from './components/profile.jsx';

export default window.user ? (
  <Route path="/" handler={App} >
    <Route path="jobs/:filter" name='jobs' handler={Jobs} />
    <Route path="my-posts" name='myPosts' handler={MyPosts} />
    <Route path="profile" name='profile' handler={Profile} />
    <DefaultRoute handler={Jobs}/>
  </Route>
) : (
  <Route path="/" handler={Front} />
);
