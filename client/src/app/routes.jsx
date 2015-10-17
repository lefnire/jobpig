import React from 'react';
import util from './lib/util'
import {Router, Route, Redirect, IndexRedirect} from 'react-router';
import App from './components/app.jsx';
import Front from './components/front/front.jsx';
import Jobs from './components/jobs/jobs.jsx';
//import MyPosts from './components/myPosts.jsx';
import Profile from './components/profile.jsx';
import createHistory from 'history/lib/createHashHistory';
import JobActions from './lib/JobActions';

export default <Router>{
  window.jwt ?
  <Route path="/"
      history={createHistory()}
      onUpdate={()=> window.scrollTo(0, 0)}
      component={App} >
    <Route path="jobs/:filter" component={Jobs} onEnter={JobActions.fetch} />
    {/*<Route path="my-posts" component={MyPosts} />*/}
    <Route path="profile" component={Profile} />
    <IndexRedirect to="jobs/inbox" />
    <Redirect path="*" to="jobs/inbox"/>
  </Route>
  :
  <Route>
    <Route path="/" component={Front} />
    <Redirect path="*" to="/" />
  </Route>
}</Router>;
