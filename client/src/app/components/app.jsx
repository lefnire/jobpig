import React from 'react';
import mui from 'material-ui';
import Router from 'react-router';
import _ from 'lodash';
import {HotKeys} from 'react-hotkeys';
import utils from '../lib/utils';

import CreateJob from './jobs/create.jsx';
import JobActions from '../lib/JobActions.js';

let {RouteHandler} = Router;
let ThemeManager = new mui.Styles.ThemeManager();
let {Colors} = mui.Styles;

let menuItems = [
  { route: 'jobs/inbox', text: 'Inbox' },
  { route: 'jobs/saved', text: 'Saved' },
  { route: 'jobs/applied', text: 'Applied' },
  { route: 'jobs/hidden', text: 'Hidden' },
  { type: mui.MenuItem.Types.SUBHEADER },
  { route: 'prospects', text: 'Prospects' },
  { route: 'profile', text: 'Profile' },
];

export default React.createClass({
  componentWillMount() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });

    this.shortcuts = utils.setupHotkeys({
      showInbox: {k:'ctrl+i', fn:()=>this._goto('jobs/inbox')},
      showSaved: {k:'ctrl+s', fn:()=>this._goto('jobs/saved')},
      showHidden: {k:'ctrl+h', fn:()=>this._goto('jobs/hidden')},
      showApplied: {k:'ctrl+a', fn:()=>this._goto('jobs/applied')},
      showProfile: {k:'ctrl+p', fn:()=>this._goto('profile')},

      // These would be better inside jobs.jsx, but for empty lists the keys aren't registered
      refresh: {k:'ctrl+r', fn:JobActions.refresh},
      createJob: {k:'shift+a', fn:()=>this.refs.createJob.show()}
    });
  },
  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  render(){
    //fixme: can use react-router to get this easier?
    var title;
    try {
      title = _.find(menuItems, {route:window.location.hash.replace(/#\//g, '')}).text;
    } catch (e) {window.location = '/#/jobs/inbox'}

    //let f = this.props.params.filter;
    //let style = {
    //  backgroundColor: f == 'saved' ? Colors.green700 :
    //  f == 'hidden' ? Colors.yellow700 :
    //  f == 'applied' ? Colors.blue700 :
    //  Colors.grey700
    //}
    let style = {};
    return (
      <mui.AppCanvas>
        <HotKeys keyMap={this.shortcuts.default.keys} handlers={this.shortcuts.default.handlers} >
          <mui.AppBar
            title={title}
            style={style}
            onLeftIconButtonTouchTap={()=>this.refs.leftNav.toggle()}
            iconElementRight={
              <mui.FlatButton label="Logout" linkButton={true} href='/logout' />
            }
            />

          <mui.LeftNav
            ref="leftNav"
            docked={false}
            menuItems={menuItems}
            onChange={this._goto}
            />
          <RouteHandler />
          <CreateJob onAction={JobActions.list} ref='createJob'/>
        </HotKeys>
      </mui.AppCanvas>
    )
  },

  _goto(e, key, payload){
    if (!payload) payload = {route:e};
    //this.context.router.transitionTo(payload.route, {params:payload.params});
    window.location = '/#/'+payload.route;
  }

});