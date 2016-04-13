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
import MUI, {
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
import Footer from './Footer';
import {me} from '../helpers';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  componentDidMount() {
    this._notifyFillProfile();
  }

  render() {
    this.location = this.props.location.pathname.replace(/^\//, '');
    let title = { //FIXME this is dirty. Use state instead?
        'jobs/match': 'Matches',
        'jobs/applied': 'Applied',
        'jobs/liked': 'Liked',
        'employer': 'Employer',
        'messages': 'Messages',
        'profile': 'Profile',
        'logout': "Logout"
      }[this.location] || 'Jobpig';

    return (
      <div className="app">
        <AppBar
          title={title}
          onLeftIconButtonTouchTap={()=>this.setState({navOpen: !this.state.navOpen})}
          iconElementRight={<RaisedButton label="Post Job" primary={true} onTouchTap={this._postJob} />}
        />
        <LeftNav
          docked={false}
          width={200}
          open={this.state.navOpen}
          onRequestChange={navOpen => this.setState({navOpen})}
        >
          <List subheader="Jobs">
            <MenuItem onTouchTap={()=>this._goto('jobs/match')} leftIcon={<ActionHome />}>Matches</MenuItem>
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

  //FIXME this is nasty. Use eventemitter or redux or something?
  _postJob = () => {
    if (this.location === 'employer') {
      return global.jobpig.createJob.open();
    }
    this._goto('employer');
    setTimeout(() => global.jobpig.createJob.open(), 100);
  };

  _goto = route => {
    this.closeNav();
    window.location = '/#/' + route;
  };

  _notifyFillProfile = () => {
    me().then(user => {
      let noData = _(user).pick('linkedin_url twitter_url stackoverflow_url github_url fullname bio company'.split(' ')).values().compact().isEmpty();
      if (noData && !_.isEmpty(user.tags)) { // don't show on initial exposure
        global.jobpig.alerts.flash({query: {flash: 'FILL_PROFILE'}});
      }
    });
  };
}
