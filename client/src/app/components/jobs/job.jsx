import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {request} from '../../lib/util';
import Prospect from './prospect.jsx';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';

//Alt
import JobStore from '../../lib/JobStore';
import JobActions from '../../lib/JobActions';
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
class Job extends React.Component {
  constructor(){
    super();
    this.state = {expanded:undefined};
  }

  static getStores() {
    return [JobStore];
  }

  static getPropsFromStores() {
    return JobStore.getState();
  }

  render() {
    let job = this.props.job,
      editing = this.props.editing == job.id;

    window.setTimeout(()=> { // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
      if (editing) return this.refs.noteRef.focus();
    });

    return <div className='padded'>
      <mui.Card>
        <mui.CardTitle
          title={<a href={job.url} target='_blank'>{job.title}</a>}
          subtitle={this._subtitle(job)}
        />
        <mui.CardText>
          Tags:&nbsp;
          <span style={{color:'rgb(0, 188, 212)', textTransform:'uppercase', fontWeight:500}}>
            {_.pluck(job.tags, 'key').join(', ')}
          </span>
          {editing ?
            <mui.Paper zDepth={2} style={{padding:5}}>
              <mui.TextField
                ref='noteRef'
                hintText="Add personal comments here."
                defaultValue={job.note}
                fullWidth={true}
                multiLine={true} />
              <mui.FlatButton label="Save" onTouchTap={()=>this._saveNote()} />&nbsp;
              <mui.FlatButton label="Cancel" onTouchTap={()=>this._cancelNote()} />
            </mui.Paper>
            : job.note && <mui.Paper zDepth={2} style={{padding:5}}>
              <p>{job.note}</p>
            </mui.Paper>
          }
        </mui.CardText>
        <mui.CardActions>{
          ( job.status=='inbox' ? [
            <mui.FlatButton label="Skip" onTouchTap={()=>this._setStatus('hidden')}/>,
            <mui.FlatButton label="Mark Applied" onTouchTap={()=>this._setStatus('applied')}/>
          ] : [
            <mui.FlatButton label="Send to Inbox" onTouchTap={()=>this._setStatus('inbox')}/>
          ]).concat(
            <mui.FlatButton label="Add Note" onTouchTap={()=>JobActions.setEditing(job.id)}/>
          )
        }</mui.CardActions>
      </mui.Card>

      <mui.Card style={{background:'#f8f8f8'}}>
        <mui.CardText>
          <p dangerouslySetInnerHTML={{__html:job.description}}></p>
          <div dangerouslySetInnerHTML={{__html:this.state.expanded}}></div>
          {job.users && job.users.map((u)=><Prospect prospect={u} />)}
        </mui.CardText>
      </mui.Card>

      {job.status == 'inbox' ?
        <div style={{position:'fixed',bottom:10,right:10}}>
          <mui.FloatingActionButton onTouchTap={()=>this._setStatus('liked')}>
            <mui.FontIcon className="material-icons">thumb_up</mui.FontIcon>
          </mui.FloatingActionButton>
          &nbsp;&nbsp;
          <mui.FloatingActionButton onTouchTap={()=>this._setStatus('disliked')}>
            <mui.FontIcon className="material-icons">thumb_down</mui.FontIcon>
          </mui.FloatingActionButton>
        </div>
        : false}
    </div>;
  }

  _subtitle(job){
    let score = job.score>0 ? `+${job.score}` : job.score<0 ? job.score : false;
    return _.reduce({Source:job.source, Company:job.company, Location:job.location, Budget:job.budget, Score:score}, (m,v,k)=>{
      if (v) m.push(`${k}: ${v}`);
      return m;
    }, []).join('; ');
  }

  _setStatus(status){
    JobActions.setStatus({id:this.props.job.id,status});
  }

  _cancelNote(){
    JobActions.setEditing(0);
  }

  _saveNote(){
    JobActions.saveNote({id:this.props.job.id, note:this.refs.noteRef.getValue()})
  }

  //_expand(){
  //  if (this.state.expanded)
  //    return this.setState({expanded:undefined});
  //  //job.expanding = true;
  //  request.get(`/jobs/${this.props.job.key}`).end((err, res) => {
  //    //job.expanding = false;
  //    this.setState({expanded: res.text});
  //  });
  //}
}

export default Job