import React from 'react';
import {
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
  AppBar,
  Divider,
  Menu,
  List,
  ListItem,
  Drawer,
  Subheader
} from 'material-ui';
import _ from 'lodash';
import Footer from './Footer';
import {me} from '../helpers';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  componentWillMount() {
    let {redirect} = this.props.location.query;
    if (redirect) this._goto(redirect);
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
          iconElementRight={<RaisedButton label="Post Job" onTouchTap={this._postJob} />}
        />
        <Drawer
          docked={false}
          width={200}
          open={this.state.navOpen}
          onRequestChange={navOpen => this.setState({navOpen})}
        >
          <Subheader>Jobs</Subheader>
          <MenuItem onTouchTap={()=>this._goto('jobs/match')} leftIcon={<FontIcon className="material-icons">home</FontIcon>}>Matches</MenuItem>
          <MenuItem onTouchTap={()=>this._goto('jobs/liked')} leftIcon={<FontIcon className="material-icons">thumb_up</FontIcon>}>Liked</MenuItem>
          <MenuItem onTouchTap={()=>this._goto('jobs/applied')} leftIcon={<FontIcon className="material-icons">check_circle</FontIcon>}>Applied</MenuItem>
          <Divider />
          <Subheader>Personal</Subheader>
          <MenuItem onTouchTap={()=>this._goto('profile')} leftIcon={<FontIcon className="material-icons">person</FontIcon>}>Profile</MenuItem>
          <MenuItem onTouchTap={()=>this._goto('messages')} leftIcon={<FontIcon className="material-icons">email</FontIcon>}>Messages</MenuItem>
          <MenuItem onTouchTap={()=>this._goto('employer')} leftIcon={<FontIcon className="material-icons">business_center</FontIcon>}>Employer</MenuItem>
          <MenuItem onTouchTap={()=>this._goto('logout')} leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>}>Logout</MenuItem>

        </Drawer>

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
