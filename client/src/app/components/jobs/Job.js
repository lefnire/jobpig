import React, {Component} from 'react';
import {
  Card,
  CardTitle,
  Paper,
  TextField,
  FlatButton,
  CardActions,
  CardText,
  FloatingActionButton,
  FontIcon,
  ListItem,
} from 'material-ui';
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
} from 'material-ui/svg-icons';
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

    return (
      <div style={styles.card} className={isInList? 'padded': ''}>
        <Card>
          <CardTitle
            title={<a className="job-title" href={job.url} target='_blank'>{job.title}</a>}
            subtitle={this._meta(job)}
            actAsExpander={isInList}
            showExpandableButton={isInList}
          />
          {isEmployer? null: (
            <div>
              {editing ?
                <Paper zDepth={2} style={{padding:5}}>
                  <TextField
                    ref={c => c && c.focus()}
                    hintText="Add personal comments here."
                    defaultValue={job.note}
                    fullWidth={true}
                    multiLine={true} />
                  <FlatButton label="Save" onTouchTap={this._saveNote} />&nbsp;
                  <FlatButton label="Cancel" onTouchTap={() => this.setState({editing: false})} />
                </Paper>
                : job.note && <Paper zDepth={2} style={{padding: 5}}>
                  <p>{job.note}</p>
                </Paper>
              }
              {isEmployer? null : (
                <CardActions>{
                  (!isMatch ? [
                    <FlatButton label="Send to Matches" onTouchTap={() => this._setStatus(FILTERS.MATCH)}/>
                  ] : []).concat(
                    <FlatButton label="Mark Applied" onTouchTap={() => this._setStatus(FILTERS.APPLIED)}/>,
                    <FlatButton label={isMatch ? 'Skip' : 'Hide'} onTouchTap={() => this._setStatus(FILTERS.HIDDEN)}/>,
                    <FlatButton label="Add Note" onTouchTap={() => this.setState({editing: true})}/>
                  )
                }</CardActions>
              )}
            </div>
          )}
          <CardText
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
          </CardText>

          {!isMatch? null : (
            <CardActions style={{position:'fixed', right:20, bottom: 20}}>
              <FloatingActionButton onTouchTap={() => this._setStatus(FILTERS.LIKED)}>
                <FontIcon className="material-icons">thumb_up</FontIcon>
              </FloatingActionButton>
              <FloatingActionButton onTouchTap={() => this._setStatus(FILTERS.DISLIKED)}>
                <FontIcon className="material-icons">thumb_down</FontIcon>
              </FloatingActionButton>
            </CardActions>
          )}
        </Card>

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
          <ListItem key={i} primaryText={item.text} leftIcon={item.icon} />
        ))}
        {this.props.isEmployer? (
          <ListItem
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
