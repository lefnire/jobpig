let React = require('react');
let mui = require('material-ui');
var ReactFireMixin = require('reactfire');
var Firebase = require('reactfire/node_modules/firebase');
var {HotKeys, HotKeyMapMixin} = require('react-hotkeys');
var _ = require('lodash');

const keyMap = {
  save: 's',
  apply: 'a',
  expand: 'e',
  open: 'enter',
  hide: 'h',
}

module.exports = React.createClass({
  mixins: [ReactFireMixin, HotKeyMapMixin(keyMap)],

  _subtitle(job){
    return (job.company || '-') +' | '+ (job.location || '-') +' | $'+ (job.budget || '-');
  },
  _setFocus: function(c){
    this.props.focus && c.getDOMNode().focus();
  },

  componentWillMount() {
    var ref = new Firebase(`https://lefnire-test.firebaseio.com/jobs/${this.props.job.key}`);
    this.bindAsObject(ref, "job");
  },

  // Actions
  _setStatus(status){
    let s = this.firebaseRefs.job.child('status');
    s.once('value', (snap)=> s.set(snap.val()==status ? null : status)  );
  },
  action_save(){this._setStatus('saved')},
  action_apply(){this._setStatus('applied')},
  action_hide(){this._setStatus('hidden')},
  action_open(){window.open(this.props.job.url,'_blank')},
  action_expand(){
    //if (job.expanded) return job.expanded=undefined;
    //job.expanding = true;
    //$http.get('/jobs/'+job.key).success(function(res){
    //  job.expanding = false;
    //  job.expanded = $sce.trustAsHtml(res);
    //});
  },

  render() {
    const handlers = _.transform(keyMap, (m,v,k)=> m[k] = this['action_'+k]);
    let job = this.props.job;

    // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
    window.setTimeout( ()=> this.props.focus && this.refs.jobref.getDOMNode().focus() );

    return (
      <HotKeys tabIndex="0" handlers={handlers} ref={/*this._setFocus*/"jobref"}>
        <mui.Card>
          <mui.CardTitle title={job.title} subtitle={this._subtitle(job)} />
          <mui.CardText>
            <b>{job.tags.join(', ')}</b>
            <p>{job.description}</p>
          </mui.CardText>
          {/*<mui.CardActions>
           <mui.RaisedButton label="Save"  secondary={true} />
           <mui.RaisedButton label="Hide" secondary={true} />
           <mui.RaisedButton label="Applied" secondary={true} />
           <mui.RaisedButton label="Expand" secondary={true} />
           </mui.CardActions>*/}
        </mui.Card>
      </HotKeys>
    )
  }
});