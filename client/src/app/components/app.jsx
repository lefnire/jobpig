import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Footer from './footer';

// Redux
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

const menuItems = [
  { route: 'jobs/inbox', text: 'Inbox' },
  { route: 'jobs/applied', text: 'Applied' },
  { route: 'jobs/liked', text: 'Liked' },
  { route: 'jobs/disliked', text: 'Disliked' },
  { type: mui.MenuItem.Types.SUBHEADER },
  //{ route: 'my-posts', text: 'My Posts' },
  { route: 'profile', text: 'Profile' },
  { route: 'logout', text:"Logout"}
];

function mapStateToProps(state) {
  return {route: state.router.location.pathname.substring(1)};
}

export default @connect(mapStateToProps, {pushState})
class App extends React.Component {
  render(){
    const {route} = this.props;
    return <div>
      <mui.AppBar
        title={_.find(menuItems, {route}).text}
        onLeftIconButtonTouchTap={()=>this.refs.leftNav.toggle()} />
      <mui.LeftNav
        ref="leftNav"
        docked={false}
        menuItems={menuItems}
        onChange={this._goto.bind(this)} />
      {this.props.children}
      <Footer />
    </div>;
  }

  _goto(e, key, payload){
    //if (!payload) payload = {route:e};
    this.props.pushState(null, '/'+payload.route);
  }
}
