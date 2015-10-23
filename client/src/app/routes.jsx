import React from 'react';
import {Router, Route, Redirect, IndexRedirect} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front/front.jsx';
import Jobs from './components/jobs/jobs.jsx';
//import MyPosts from './components/myPosts.jsx';
import Profile from './components/profile.jsx';
import util from './util';

export default window.jwt ? (
  <Route path="/"
   onUpdate={()=> window.scrollTo(0, 0)}
   component={App} >
    <Route path="jobs/:filter" component={Jobs} />
    {/*<Route path="my-posts" component={MyPosts} />*/}
    <Route path="profile" component={Profile} />
    <Route path="logout" onEnter={util.auth.logout} />
    <IndexRedirect to="jobs/inbox" />
    <Redirect path="*" to="jobs/inbox"/>
  </Route>
) : (
  <Route>
    <Route path="/" component={Front} />
    <Route path="logout" onEnter={util.auth.logout} />
    <Redirect path="*" to="/" />
  </Route>
);
