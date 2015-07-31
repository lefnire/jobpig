import React from 'react';
import mui from 'material-ui';
import {HotKeys, HotKeyMapMixin} from 'react-hotkeys';
import _ from 'lodash';
import request from 'superagent';
import Thumb from './thumb.jsx';
import utils from '../../lib/utils';

//Alt
import alt from '../../lib/alt';
import JobStore from '../../lib/JobStore';
import JobActions from '../../lib/JobActions';
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
class Job extends React.Component {
  constructor(){
    super();
    this.state = {expanded:undefined};

    // Setup keyboard shortcuts. Most defer to JobActions, so I inline them here. More complex bits defined below
    this.shortcuts = utils.setupHotkeys({
      save: {k:'s', fn:()=>JobActions.setStatus({id:this.props.job.id,status:'saved'})},
      apply: {k:'a', fn:()=>JobActions.setStatus({id:this.props.job.id,status:'applied'})},
      hide: {k:'h', fn:()=>JobActions.setStatus({id:this.props.job.id,status:'hidden'})},
      inbox: {k:'i', fn:()=>JobActions.setStatus({id:this.props.job.id,status:'inbox'})},
      expand: {k:'e', fn:this._expand.bind(this)},
      addNote: {k:'n', fn:()=>JobActions.setEditing(this.props.job.id)},
      open: {k:'enter', fn:()=>window.open(this.props.job.url,'_blank')},
      //thumbsUp: {k:'shift+s', fn:()=>this.refs.thumb.show('Like')},
      //thumbsDown: {k:'shift+h', fn:()=>this.refs.thumb.show('Dislike')},
      forceHide: {k:'shift+h', fn:()=>JobActions.setStatus({id:this.props.job.id,status:'hidden',force:true})},

      cancelNote: {k:'esc', enabledWhenEditing:true, fn:()=>JobActions.setEditing(0)},
      saveNote: {k:'ctrl+enter', enabledWhenEditing:true, fn:()=>JobActions.saveNote({id:this.props.job.id, note:this.refs.noteRef.getValue()})}
    });
  }

  static getStores() {
    return [JobStore];
  }

  static getPropsFromStores() {
    return JobStore.getState();
  }

  render() {
    let job = this.props.job,
      editing = this.props.editing == this.props.job.id;

    let mainSection = (
      <mui.Card>
        <mui.CardTitle title={job.title} subtitle={this._subtitle(job)} />
        <mui.CardText>
          <b>{job.tags[0] && _.pluck(job.tags, 'key').join(', ')}</b>
          <p dangerouslySetInnerHTML={{__html:job.description}}></p>
          <div dangerouslySetInnerHTML={{__html:this.state.expanded}}></div>
          {editing ?
            <mui.TextField ref='noteRef' hintText="Add personal comments here." defaultValue={this.props.job.note} multiLine={true} /> :
            this.props.job.note && <mui.Paper zDepth={2} style={{padding:5}}><p>{this.props.job.note}</p></mui.Paper>
          }
        </mui.CardText>
      </mui.Card>
    );
    if (!this.props.focus) return mainSection;

    window.setTimeout(()=> { // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
      if (editing) return this.refs.noteRef.focus();
      this.refs.jobref.getDOMNode().focus();
    });
    let mode = editing ? 'editing' : 'default';
    return (
      <HotKeys tabIndex="0"
           keyMap={this.shortcuts[mode].keys}
           handlers={this.shortcuts[mode].handlers}
           ref={/*this._setFocus*/"jobref"}>
        <Thumb ref='thumb' job={this.props.job} onAction={this.props.onAction} />
        {mainSection}
      </HotKeys>
    )
  }

  _subtitle(job){
    let score = job.score<0 ? job.score : `+${job.score}`;
    return `${job.source} | ${job.company || '-'} | ${job.location || '-'} | $${job.budget || '-'} | ${score}`;
  }

  _expand(){
    if (this.state.expanded)
      return this.setState({expanded:undefined});
    //job.expanding = true;
    request.get(`/jobs/${this.props.job.key}`).end((err, res) => {
      //job.expanding = false;
      this.setState({expanded: res.text});
    });
  }
}

export default Job