import React from 'react';
import mui from 'material-ui';
import {HotKeys, HotKeyMapMixin} from 'react-hotkeys';
import _ from 'lodash';
import request from 'superagent';
import Thumb from './thumbs.jsx';

const keyMap = {
  save: 's',
  apply: 'a',
  expand: 'e',
  open: 'enter',
  hide: 'h',
  inbox: 'i',

  addNote: 'n',
  cancelNote: 'esc',
  saveNote: 'ctrl+enter',

  thumbsUp: 'shift+s',
  thumbsDown: 'shift+h'
}

export default class Job extends React.Component {
  constructor(){
    super();
    this.state = {expanded:undefined};
  }

  render() {
    let job = this.props.job;
    let mainSection = (
      <mui.Card>
        <mui.CardTitle title={job.title} subtitle={()=>this._subtitle(job)} />
        <mui.CardText>
          <b>{job.tags[0] && _.pluck(job.tags, 'text').join(', ')}</b>
          <p>{job.description}</p>
          <div dangerouslySetInnerHTML={{__html:this.state.expanded}}></div>
          {this.state.addingNote ?
            <mui.TextField ref='noteRef' hintText="Add personal comments here." defaultValue={this.props.job.note} multiLine={true} /> :
            this.props.job.note && <mui.Paper zDepth={2} style={{padding:5}}><p>{this.props.job.note}</p></mui.Paper>
          }
        </mui.CardText>
      </mui.Card>
    );
    if (!this.props.focus) return mainSection;

    const handlers = _.transform(keyMap, (m,v,k)=> {
      // disable non-note shortcuts when working with notes FIXME j & k from parent
      if (this.state.addingNote && !_.includes(['addNote', 'cancelNote', 'saveNote'], k)) return;
      m[k] = this['_action_' + k].bind(this);
    });
    window.setTimeout(()=> { // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
      if (this.state.addingNote)
        return this.refs.noteRef.focus();
      this.refs.jobref.getDOMNode().focus();
    });
    return (
      <HotKeys tabIndex="0" keyMap={keyMap} handlers={handlers} ref={/*this._setFocus*/"jobref"}>
        <Thumb ref='thumb' job={this.props.job} onAction={this.props.onAction} />
        {mainSection}
      </HotKeys>
    )
  }

  _subtitle(job){
    return `${job.source} | ${job.company || '-'} | ${job.location || '-'} | $${job.budget || '-'}`;
  }
  _setFocus(c){
    this.props.focus && c.getDOMNode().focus();
  }

  // Actions
  _setStatus(status){
    request.post(`/jobs/${this.props.job.id}/${status}`).end((err,res)=>{
      this.props.onAction(); //fixme this is dumb, use flux?
    })
  }
  _action_inbox(){this._setStatus('inbox')}
  _action_save(){this._setStatus('saved')}
  _action_apply(){this._setStatus('applied')}
  _action_hide(){this._setStatus('hidden')}
  _action_open(){window.open(this.props.job.url,'_blank')}
  _action_expand(){
    if (this.state.expanded)
      return this.setState({expanded:undefined});
    //job.expanding = true;
    request.get(`/jobs/${this.props.job.key}`).end((err, res) => {
      //job.expanding = false;
      this.setState({expanded: res.text});
    });
  }
  _action_thumbsUp(){
    this.refs.thumb.show('Like');
  }
  _action_thumbsDown(){
    this.refs.thumb.show('Dislike');
  }

  _action_cancelNote(){
    this.setState({addingNote:false});
  }
  _action_addNote(){
    this.setState({addingNote:true});
  }
  _action_saveNote(){
    let note = this.refs.noteRef.getValue();
    request.post(`/jobs/${this.props.job.id}/add-note`, {note}).end(()=>{});
    this.props.job.note = note; //fixme with flux
    this.setState({addingNote:false});
  }
}