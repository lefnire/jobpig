import React from 'react';
import mui from 'material-ui';
import Router from 'react-router';
import _ from 'lodash';
import util from '../lib/util';

import JobActions from '../lib/JobActions.js';

let {RouteHandler} = Router;

let menuItems = [
  { route: 'jobs/inbox', text: 'Inbox' },
  { route: 'jobs/applied', text: 'Applied' },
  { route: 'jobs/liked', text: 'Liked' },
  { route: 'jobs/disliked', text: 'Disliked' },
  { type: mui.MenuItem.Types.SUBHEADER },
  //{ route: 'my-posts', text: 'My Posts' },
  { route: 'profile', text: 'Profile' },
  { route: 'logout', text:"Logout"}
];

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render(){
    let title = _.find(menuItems, {
      route:this.context.router.getCurrentPath().replace(/^\//,'')
    }).text;

    return <div>
      <mui.AppBar
        title={title}
        onLeftIconButtonTouchTap={()=>this.refs.leftNav.toggle()}
        />
      <mui.LeftNav
        ref="leftNav"
        docked={false}
        menuItems={menuItems}
        onChange={this._goto}
        />
      <RouteHandler />
    </div>;
  },

  _goto(e, key, payload){
    if (!payload) payload = {route:e};

    if (payload.route==='logout') return util.auth.logout();

    this.context.router.replaceWith('/'+payload.route);
    if (this.context.router.isActive('jobs')) JobActions.fetch();

    //FIXME: router.transitionTo is only working the first click, any time after doesn't change routes???
    window.setTimeout(()=>{
      if (this.context.router.getCurrentPath() !== '/'+payload.route) return window.location.reload();
    })
  }

});
