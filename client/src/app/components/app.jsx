import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import util from '../lib/util';

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
    location: React.PropTypes.object
  },
  render(){
    let title = _.find(menuItems, {
      route: this.props.location.pathname.replace(/^\//,'')
    }).text;

    return <div>
      <mui.AppBar
        title={title}
        onLeftIconButtonTouchTap={()=>this.refs.leftNav.toggle()} />
      <mui.LeftNav
        ref="leftNav"
        docked={false}
        menuItems={menuItems}
        onChange={this._goto} />
      {this.props.children}
    </div>;
  },

  _goto(e, key, payload){
    if (!payload) payload = {route:e};
    if (payload.route==='logout') return util.auth.logout();
    this.props.history.pushState(null, '/'+payload.route);
  }

});
