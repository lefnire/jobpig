import React from 'react';
import mui from 'material-ui';
import Router from 'react-router';
import _ from 'lodash';
import {HotKeys} from 'react-hotkeys';
import {setupHotkeys} from '../lib/util';

import JobActions from '../lib/JobActions.js';

let {RouteHandler} = Router;

let menuItems = [
  { route: 'jobs/inbox', text: 'Inbox' },
  { route: 'jobs/applied', text: 'Applied' },
  { route: 'jobs/liked', text: 'Liked' },
  { route: 'jobs/disliked', text: 'Disliked' },
  { type: mui.MenuItem.Types.SUBHEADER },
  { route: 'my-posts', text: 'My Posts' },
  { route: 'profile', text: 'Profile' },
  { route: 'logout', text:"Logout"}
];

export default React.createClass({
  componentWillMount() {
    this.shortcuts = setupHotkeys({
      showInbox: {k:'ctrl+i', fn:()=>this._goto('jobs/inbox')},
      showLiked: {k:'ctrl+s', fn:()=>this._goto('jobs/liked')},
      showDisliked: {k:'ctrl+h', fn:()=>this._goto('jobs/disliked')},
      showApplied: {k:'ctrl+a', fn:()=>this._goto('jobs/applied')},
      showProfile: {k:'ctrl+p', fn:()=>this._goto('profile')},
    });
  },
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render(){
    var title = _.find(menuItems, {
      route:this.context.router.getCurrentPath().replace(/^\//,'')
    }).text;

    return (
      <mui.AppCanvas>
        <HotKeys keyMap={this.shortcuts.default.keys} handlers={this.shortcuts.default.handlers} >
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
        </HotKeys>
      </mui.AppCanvas>
    )
  },

  _goto(e, key, payload){
    if (!payload) payload = {route:e};

    if (payload.route=='logout') {
      window.sessionStorage.removeItem('jwt');
      return window.location = '/';
    }

    this.context.router.replaceWith('/'+payload.route);
    if (this.context.router.isActive('jobs')) JobActions.fetch();

    //FIXME: router.transitionTo is only working the first click, any time after doesn't change routes???
    window.setTimeout(()=>{
      if (this.context.router.getCurrentPath() != '/'+payload.route) return window.location.reload();
    })
  }

});