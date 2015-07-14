let React = require('react');
let mui = require('material-ui');
var {HotKeys, HotKeyMapMixin} = require('react-hotkeys');
var _ = require('lodash');
var request = require('superagent');
var Thumb = require('./thumbs.jsx');

const keyMap = {
  save: 's',
  apply: 'a',
  expand: 'e',
  open: 'enter',
  hide: 'h',
  inbox: 'i',
  thumbsUp: 'shift+s',
  thumbsDown: 'shift+h'
}

module.exports = React.createClass({
  mixins: [HotKeyMapMixin(keyMap)],

  _subtitle(job){
    return `${job.source} | ${job.company || '-'} | ${job.location || '-'} | $${job.budget || '-'}`;
  },
  _setFocus: function(c){
    this.props.focus && c.getDOMNode().focus();
  },

  getInitialState(){
    return {expanded:undefined}
  },

  // Actions
  _setStatus(status){
    request.post(`/jobs/${this.props.job.key}/${status}`).end((err,res)=>{
      this.props.onAction(); //fixme this is dumb, use flux?
    })
  },
  action_inbox(){this._setStatus('inbox')},
  action_save(){this._setStatus('saved')},
  action_apply(){this._setStatus('applied')},
  action_hide(){this._setStatus('hidden')},
  action_open(){window.open(this.props.job.url,'_blank')},
  action_expand(){
    if (this.state.expanded)
      return this.setState({expanded:undefined});
    //job.expanding = true;
    request.get(`/jobs/${this.props.job.key}`).end((err, res) => {
      //job.expanding = false;
      this.setState({expanded: res.text});
    });
  },
  action_thumbsUp(){
    this.refs.thumb.show('Like');
  },
  action_thumbsDown(){
    this.refs.thumb.show('Dislike');
  },

  render() {
    let job = this.props.job;
    let mainSection = (
      <mui.Card>
        <mui.CardTitle title={job.title} subtitle={this._subtitle(job)} />
        <mui.CardText>
          <b>{_.pluck(job.Tags, 'text').join(', ')}</b>
          <p>{job.description}</p>
          <div dangerouslySetInnerHTML={{__html:this.state.expanded}}></div>
        </mui.CardText>
      </mui.Card>
    );
    if (!this.props.focus) return mainSection;

    const handlers = _.transform(keyMap, (m,v,k)=> m[k] = this['action_'+k]);
    window.setTimeout(()=> this.refs.jobref.getDOMNode().focus()); // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
    return (
      <HotKeys tabIndex="0" handlers={handlers} ref={/*this._setFocus*/"jobref"}>
        <Thumb ref='thumb' job={this.props.job} />
        {mainSection}
      </HotKeys>
    )
  }
});