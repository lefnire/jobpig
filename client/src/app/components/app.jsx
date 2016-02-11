import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import Footer from './footer';

const menuItems = [
  {route: 'jobs/inbox', text: 'Inbox' },
  {route: 'jobs/applied', text: 'Applied' },
  {route: 'jobs/liked', text: 'Liked' },
  //{route: 'jobs/disliked', text: 'Disliked' },
  //{ type: mui.MenuItem.Types.SUBHEADER },
  {route: 'employer', text: 'Employer' },
  {route: 'messages', text: 'Messages' },
  {route: 'profile', text: 'Profile' },
  {route: 'logout', text:"Logout"}
];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render(){
    //let {route} = this.props;
    let route = this.props.location.pathname.replace(/^\//,'');
    return (
      <div>
        <mui.AppBar
          title={_.find(menuItems, {route}).text}
          onLeftIconButtonTouchTap={this.handleToggle}
          onRequestChange={open => this.setState({open})} />
        <mui.LeftNav
          open={this.state.open}
          docked={false} >
          {menuItems.map((v,i) =>
            <mui.MenuItem
                primaryText={v.text}
                onTouchTap={() => this._goto(v.route)}
                key={'menu-item-' + i} />
          )}
        </mui.LeftNav>
        {this.props.children}
        <Footer />
      </div>
    );
  }

  handleToggle = () => this.setState({open: !this.state.open});
  handleClose = () => this.setState({open: false});

  _goto = route => {
    this.handleClose();
    window.location = '/#/' + route;
  }
}
