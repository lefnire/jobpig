import React from 'react';
import mui from 'material-ui';
import {HotKeys, HotKeyMapMixin} from 'react-hotkeys';
import _ from 'lodash';
import request from 'superagent';
import Thumb from './thumbs.jsx';

//Alt
import alt from '../alt/alt';
import JobStore from '../alt/JobStore';
import JobActions from '../alt/JobActions';
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
class Job extends React.Component {
  constructor(){
    super();
    this.state = {expanded:undefined};

    // Setup keyboard shortcuts. Most defer to JobActions, so I inline them here. More complex bits defined below
    _.each({
      shortcuts:{
        save: ['s', ()=>JobActions.setStatus({id:this.props.job.id,status:'saved'})],
        apply: ['a', ()=>JobActions.setStatus({id:this.props.job.id,status:'applied'})],
        hide: ['h', ()=>JobActions.setStatus({id:this.props.job.id,status:'hidden'})],
        inbox: ['i', ()=>JobActions.setStatus({id:this.props.job.id,status:'inbox'})],
        expand: ['e', this._expand.bind(this)],
        addNote: ['n', ()=>JobActions.setEditing(this.props.job.id)],
        open: ['enter', ()=>window.open(this.props.job.url,'_blank')],
        thumbsUp: ['shift+s', ()=>this.refs.thumb.show('Like')],
        thumbsDown: ['shift+h', ()=>this.refs.thumb.show('Dislike')]
      },
      editing_shortcuts:{
        cancelNote: ['esc', ()=>JobActions.setEditing(0)],
        saveNote: ['ctrl+enter',()=>JobActions.saveNote({id:this.props.job.id, note:this.refs.noteRef.getValue()})],
      }
    }, (obj,k)=>{
      this[k] = _.reduce(obj, (m,v,k)=>{
        m.keys[k] = v[0];
        m.handlers[k] = v[1];
        return m;
      }, {keys:{},handlers:{}});
    })
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
          <b>{job.tags[0] && _.pluck(job.tags, 'text').join(', ')}</b>
          <p>{job.description}</p>
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
    return (
      <HotKeys tabIndex="0"
           keyMap={editing ? this.editing_shortcuts.keys : this.shortcuts.keys}
           handlers={editing ? this.editing_shortcuts.handlers : this.shortcuts.handlers}
           ref={/*this._setFocus*/"jobref"}>
        <Thumb ref='thumb' job={this.props.job} onAction={this.props.onAction} />
        {mainSection}
      </HotKeys>
    )
  }

  _subtitle(job){
    return `${job.source} | ${job.company || '-'} | ${job.location || '-'} | $${job.budget || '-'}`;
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