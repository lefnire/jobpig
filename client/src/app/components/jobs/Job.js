import React, {Component} from 'react';
import MUI from 'material-ui';
import _ from 'lodash';
import Prospect from '../employer/Prospect';
import {
  NavigationMoreVert,
  ActionFindInPage,
  ActionSupervisorAccount,
  ActionRoom,
  ActionThumbUp,
  ActionLabel,
  ActionSchedule,
  ImageRemoveRedEye,
  EditorInsertChart
} from 'material-ui/lib/svg-icons';
import {_fetch, constants} from '../../helpers';
const {FILTERS, TAG_TYPES} = constants;

export default class Job extends Component {
  constructor(){
    super();
    this.state = {
      editing: false
    };
  }

  render() {
    let {job, isEmployer, style} = this.props;
    let {editing} = this.state;
    let isMatch = job.status === FILTERS.MATCH;
    let isInList = _.includes([FILTERS.APPLIED, FILTERS.LIKED, FILTERS.DISLIKED], job.status);
    let styles = {
      card: _.defaults({}, style, isInList && {marginBottom: 20})
    };

    window.setTimeout(() => { // FIXME This is bad, but using ref + componentDidMount isn't calling every render???
      if (editing) return this.refs.noteRef.focus();
    });

    // Test tag issues: jobs have multiple companies, locations, etc. Remove after a while
    //if (_.reduce([2,3,4], (m,type) => m && _.filter(job.tags, {type}).length>1, true)) debugger;

    return (
      <div style={styles.card} className={isInList? 'padded': ''}>
        <MUI.Card>
          <MUI.CardTitle
            title={<a className="job-title" href={job.url} target='_blank'>{job.title}</a>}
            subtitle={this._meta(job)}
            actAsExpander={isInList}
            showExpandableButton={isInList}
          />
          {isEmployer? null: (
            <div>
              {editing ?
                <MUI.Paper zDepth={2} style={{padding:5}}>
                  <MUI.TextField
                    ref='noteRef'
                    hintText="Add personal comments here."
                    defaultValue={job.note}
                    fullWidth={true}
                    multiLine={true} />
                  <MUI.FlatButton label="Save" onTouchTap={this._saveNote} />&nbsp;
                  <MUI.FlatButton label="Cancel" onTouchTap={() => this.setState({editing: false})} />
                </MUI.Paper>
                : job.note && <MUI.Paper zDepth={2} style={{padding: 5}}>
                  <p>{job.note}</p>
                </MUI.Paper>
              }
              {isEmployer? null : (
                <MUI.CardActions>{
                  (!isMatch ? [
                    <MUI.FlatButton label="Send to Matches" onTouchTap={() => this._setStatus(FILTERS.MATCH)}/>
                  ] : []).concat(
                    <MUI.FlatButton label="Mark Applied" onTouchTap={() => this._setStatus(FILTERS.APPLIED)}/>,
                    <MUI.FlatButton label={isMatch ? 'Skip' : 'Hide'} onTouchTap={() => this._setStatus(FILTERS.HIDDEN)}/>,
                    <MUI.FlatButton label="Add Note" onTouchTap={() => this.setState({editing: true})}/>
                  )
                }</MUI.CardActions>
              )}
            </div>
          )}
          <MUI.CardText
            style={{background:'#f8f8f8'}}
            expandable={isInList}
            ref={c => isInList && c && c.setState({expanded: false})}
          >
            <p dangerouslySetInnerHTML={{__html:job.description}}></p>
            {!job.users? null: (
              <div>
                <h4>Matching Candidates</h4>
                {job.users.map(u => <Prospect key={u.id} prospect={u} />)}
              </div>
            )}
          </MUI.CardText>

          {!isMatch? null : (
            <MUI.CardActions style={{position:'fixed', right:20, bottom: 20}}>
              <MUI.FloatingActionButton onTouchTap={() => this._setStatus(FILTERS.LIKED)}>
                <MUI.FontIcon className="material-icons">thumb_up</MUI.FontIcon>
              </MUI.FloatingActionButton>
              <MUI.FloatingActionButton onTouchTap={() => this._setStatus(FILTERS.DISLIKED)}>
                <MUI.FontIcon className="material-icons">thumb_down</MUI.FontIcon>
              </MUI.FloatingActionButton>
            </MUI.CardActions>
          )}
        </MUI.Card>

      </div>
    );
  }

  _meta = job => {
    let score = job.score && (job.score > 0 ? '+' : '') + job.score;
    let _getFeat = type => _.get(_.find(job.tags, {type}), 'text');
    let items = _.filter([
      {text: _getFeat(TAG_TYPES.COMPANY), icon: <ActionSupervisorAccount tooltip="Company" />},
      {text: _getFeat(TAG_TYPES.LOCATION), icon: <ActionRoom tooltip="Location" />},
      {text: _getFeat(TAG_TYPES.COMMITMENT), icon: <ActionSchedule tooltip="Commitment" />},
      {
        text: (score ? `(${score}) ` : '') + _(job.tags).filter({type: TAG_TYPES.SKILL}).map('text').join(', '),
        icon: <ActionLabel tooltip="Tags"/>
      }
    ], 'text');
    return (
      <span>
        {items.map((item, i) => (
          <MUI.ListItem key={i} primaryText={item.text} leftIcon={item.icon} />
        ))}
        {this.props.isEmployer? (
          <MUI.ListItem
            primaryText={`${job.views} Views, ${job.likes} Likes, ${job.dislikes} Dislikes`}
            leftIcon={<EditorInsertChart tooltip="Views" />}
          />
        ): null}
      </span>
    );
  }

  _setStatus = status => {
    _fetch(`jobs/${this.props.job.id}/${status}`, {method: "POST"})
      .then(this.props.onSetStatus)
      .catch(global.jobpig.alerts.alert);
  };

  _saveNote = () => {
    let note = this.refs.noteRef.getValue();
    _fetch(`jobs/${this.props.job.id}/add-note`, {method: "POST", body: {note}})
      .then(json => {
        this.props.job.note = note;
        this.setState({editing: false});
      }).catch(global.jobpig.alerts.alert);
  };
}
