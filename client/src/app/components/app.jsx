import React from 'react';
import {
  SocialPerson,
  CommunicationEmail,
  PlacesBusinessCenter,
  ActionExitToApp,
  ActionHome,
  ActionThumbUp,
  ActionCheckCircle
} from 'material-ui/lib/svg-icons';
//import FontIcon from 'material-ui/lib/font-icon';
import mui, {
  Toolbar,
  ToolbarGroup,
  DropDownMenu,
  MenuItem,
  ToolbarTitle,
  FontIcon,
  IconMenu,
  ToolbarSeparator,
  RaisedButton,
  IconButton,
  FlatButton,
  LeftNav,
  AppBar,
  Divider,
  Menu,
  List,
  ListItem
} from 'material-ui';
import { Colors } from 'material-ui/lib/styles';
import _ from 'lodash';
import Footer from './footer';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render() {
    let title = { //FIXME this is dirty. Use state instead?
        'jobs/inbox': 'Inbox',
        'jobs/applied': 'Applied',
        'jobs/liked': 'Liked',
        'employer': 'Employer',
        'messages': 'Messages',
        'profile': 'Profile',
        'logout': "Logout"
      }[this.props.location.pathname.replace(/^\//, '')] || 'Jobpig';

    return (
      <div>
        <AppBar
          title={title}
          onLeftIconButtonTouchTap={()=>this.setState({navOpen: !this.state.navOpen})}
          iconElementRight={<RaisedButton label="Post Job" primary={true} onTouchTap={()=>this._goto('employer?createJob=true')} />}
        />
        <LeftNav
          docked={false}
          width={200}
          open={this.state.navOpen}
          onRequestChange={navOpen => this.setState({navOpen})}
        >
          <List subheader="Jobs">
            <MenuItem onTouchTap={()=>this._goto('jobs/inbox')} leftIcon={<ActionHome />}>Inbox</MenuItem>
            <MenuItem onTouchTap={()=>this._goto('jobs/liked')} leftIcon={<ActionThumbUp />}>Liked</MenuItem>
            <MenuItem onTouchTap={()=>this._goto('jobs/applied')} leftIcon={<ActionCheckCircle />}>Applied</MenuItem>
          </List>
          <Divider />
          <List subheader="Personal">
            <MenuItem onTouchTap={()=>this._goto('profile')} leftIcon={<SocialPerson />}>Profile</MenuItem>
            <MenuItem onTouchTap={()=>this._goto('messages')} leftIcon={<CommunicationEmail />}>Messages</MenuItem>
            <MenuItem onTouchTap={()=>this._goto('employer')} leftIcon={<PlacesBusinessCenter />}>Employer</MenuItem>
            <MenuItem onTouchTap={()=>this._goto('logout')} leftIcon={<ActionExitToApp />}>Logout</MenuItem>
          </List>

        </LeftNav>

        {this.props.children}

        <Footer />
      </div>
    );
  }

  toggleNav = () => this.setState({navOpen: !this.state.navOpen});
  closeNav = () => this.setState({navOpen: false});

  _goto = route => {
    this.closeNav();
    window.location = '/#/' + route;
  }
}
