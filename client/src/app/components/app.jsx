import React from 'react';
import {
  SocialPerson,
  CommunicationEmail,
  PlacesBusinessCenter
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
} from 'material-ui';
import _ from 'lodash';
import Footer from './footer';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  render(){
    let title = { //FIXME this is dirty. Use state instead?
      'jobs/inbox': 'Inbox',
      'jobs/applied': 'Applied',
      'jobs/liked': 'Liked',
      'employer': 'Employer',
      'messages': 'Messages',
      'profile': 'Profile',
      'logout': "Logout"
    }[this.props.location.pathname.replace(/^\//,'')] || 'Jobpig';
    return (
      <div>
        <Toolbar>
          <ToolbarTitle text={title} />
          <ToolbarGroup float="right">
            <DropDownMenu value='inbox' onChange={(evt, idx, val) => this._goto('jobs/' + val)}>
              <MenuItem value='inbox' primaryText="Inbox"/>
              <MenuItem value='applied' primaryText="Applied" />
              <MenuItem value='liked' primaryText="Liked" />
            </DropDownMenu>
            <IconButton touch={true} tooltip='Employer' onTouchTap={() => this._goto('employer')}>
              <PlacesBusinessCenter />
            </IconButton>
            <IconButton touch={true} tooltip='Messages' onTouchTap={() => this._goto('messages')}>
              <CommunicationEmail />
            </IconButton>
            <IconMenu
              tooltip="Profile"
              iconButtonElement={<IconButton touch={true}><SocialPerson /></IconButton>} >
              <MenuItem primaryText="Profile" onTouchTap={() => this._goto('profile')} />
              <MenuItem primaryText="Logout" onTouchTap={() => this._goto('logout')} />
            </IconMenu>

          </ToolbarGroup>
        </Toolbar>

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
