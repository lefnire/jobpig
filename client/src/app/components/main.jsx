/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');

let mui = require('material-ui');
//let {AppBar, List, ListItem, Card, CardHeader, CardText, CardTitle, CardActions, FloatingActionButton} = mui;
let {Colors} = mui.Styles;
let ThemeManager = new mui.Styles.ThemeManager();
var ReactFireMixin = require('reactfire');
var Firebase = require('reactfire/node_modules/firebase');
var {HotKeys, HotKeyMapMixin} = require('react-hotkeys');
var _ = require('lodash');
var Job = require('./job.jsx');
var request = require('superagent');
var Prospects = require('./prospects.jsx');

// Simple "name:key sequence/s" to create a hotkey map
const keyMap = {
  up: 'k',
  down: 'j',
  showInbox: 'ctrl+i',
  showSaved: 'ctrl+s',
  showHidden: 'ctrl+h',
  showApplied: 'ctrl+a',
  showPropsects: 'ctrl+p',
  refresh: 'ctrl+r'
};

let Main = React.createClass({
  mixins: [ReactFireMixin, HotKeyMapMixin(keyMap)],

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
    var firebaseRef = new Firebase("https://lefnire-test.firebaseio.com/jobs/");
    this.bindAsArray(firebaseRef, "jobs");
  },

  getInitialState: function() {
    return {
      jobs: [],
      filter:'inbox',
      focus:0
    };
  },

  // Actions
  action_up() {
    let focus = this.state.focus-1;
    if (focus<0) return;
    this.setState({focus});
  },
  action_down(){
    let focus = this.state.focus+1;
    if (focus>this.jobsLen-1) return;
    this.setState({focus});
  },
  action_showInbox(){
    this.setState({focus:0, filter:'inbox'});
  },
  action_showSaved(){
    this.setState({focus:0, filter:'saved'});
  },
  action_showHidden(){
    this.setState({focus:0, filter:'hidden'});
  },
  action_showApplied(){
    this.setState({focus:0, filter:'applied'});
  },
  action_showPropsects(){
    this.setState({focus:0, filter:'prospects'});
  },
  action_refresh(){
    request.post('/jobs').end(()=>{});
  },

  render() {
    if (!window.user) {
      return (<mui.RaisedButton label="Login" linkButton={true} href='/auth/linkedin' />);
    }


    const handlers = _.transform(keyMap, (m,v,k)=> m[k] = this['action_'+k]);
    let f = this.state.filter;
    let title = _.capitalize(this.state.filter);
    let style = {
      backgroundColor:
        f=='saved' ? Colors.green700 :
        f=='hidden' ? Colors.yellow700 :
        f=='applied' ? Colors.blue700 :
        Colors.grey700
    }

    let jobs = _(this.state.jobs)
      .filter({status:this.state.filter})
      .map((job,i)=> <Job job={job} key={job.key} focus={i==this.state.focus} i={i} /> )
      .value();
    this.jobsLen = jobs.length;

    // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
    window.setTimeout( ()=> this.jobsLen<1 && this.refs.hotkeys.getDOMNode().focus() );

    if (this.state.filter=='prospects')
      jobs = <Prospects />

    return (
      <HotKeys handlers={handlers} ref='hotkeys'>
        <mui.AppBar title={title} style={style} iconElementRight={
          <mui.FlatButton label="Logout" linkButton={true} href='/logout' />
        } />
        {jobs}
      </HotKeys>
    );
  },

});

module.exports = Main;
