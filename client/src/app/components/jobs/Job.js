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
import {_fetch, constants, me, _ga, loggedIn} from '../../helpers';
const {FILTERS, TAG_TYPES} = constants;
import ads from './ads';
import load from 'load-script';

let adRotate = 0, ad;

// Keep variation up here; Job will be constructed many times, but we only want to call setupExperiment() once
let variation = null;
export default class Job extends Component {
  constructor(){
    super();
    this.state = {
      editing: false
    };
    this.setupExperiment();
  }

  setupExperiment = () => {
    if (variation !== null || jobpig.env !== 'production') return;
    load('//www.google-analytics.com/cx/api.js?experiment=DKkWC2b4QpexgU6N_gZEFA', (err, script) => {
      if (err || !window.cxApi) return;
      variation = window.cxApi.chooseVariation();
    });
  };

  rotateAd = () => {
    if (variation !== 1) return;
    if (adRotate++ % 3 !== 0) return; // not every job
    me(true).then(profile => {
      let tag = _(profile.tags).sortBy(t => -t.user_tags.score).find(t => ads[t.key]);
      ad = tag && _.sample(ads[tag.key]);
    });
  };

  render() {
    let {job, isEmployer, style, anon} = this.props;
    let {editing} = this.state;
    let isMatch = job.status === FILTERS.MATCH;
    let isInList = _.includes([FILTERS.APPLIED, FILTERS.LIKED, FILTERS.DISLIKED], job.status);
    let jobLink = !job.url || ~job.url.indexOf('jobpigapp.com') ? job.title
      : <a className="job-title" href={job.url} target='_blank'>{job.title}</a>
    this.rotateAd();

    let styles = {
      card: _.defaults({}, style, isInList && {marginBottom: 20}),
      cardText: {background:'#f8f8f8'}
    };

    let actions = null;
    if (isEmployer) {
      actions = null;
    } else if (anon && !loggedIn()) {
      //actions = [<FlatButton label="Contact" onTouchTap={() => {}} />]
      actions = null;
    } else {
      actions = [
        <FlatButton label="Mark Applied" onTouchTap={() => this._setStatus(FILTERS.APPLIED)}/>,
        <FlatButton label={isMatch ? 'Skip' : 'Hide'} onTouchTap={() => this._setStatus(FILTERS.HIDDEN)}/>,
        <FlatButton label="Add Note" onTouchTap={() => this.setState({editing: true})}/>
      ];
      if (!isMatch) actions.unshift(
        <FlatButton label="Send to Matches" onTouchTap={() => this._setStatus(FILTERS.MATCH)}/>
      );
    }

    return (
      <div style={styles.card} className={isInList? 'padded': ''}>
        <Card>
          <CardTitle
            title={jobLink}
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
              {actions && <CardActions>{actions}</CardActions>}
            </div>
          )}
          <CardText
            style={styles.cardText}
            expandable={isInList}
            ref={c => isInList && c && c.setState({expanded: false})}
          >
            {!job.user_id && ad && (
              <div style={{float: 'left', margin: '0px 20px 10px 0px', border: '1px solid #E6E6E6'}}>
                <h5>Advertisement</h5>
                <a href={ad.href} onClick={() => {_ga.event('revenue', 'ad-click')}} target="_blank"><img border="0" src={ad.img1} /></a><img src={ad.img2} width="1" height="1" border="0" alt="" style={{border:'none', margin:0}} />
              </div>
            )}
            <p dangerouslySetInnerHTML={{__html:job.description}}></p>
            {anon && !loggedIn() && (
              <p className="alert alert-warning">Register to contact this employer (click "Get Started" below)</p>
            )}
            {!job.users? null: (
              <div>
                <h4>Matching Candidates</h4>
                {job.users.map(u => <Prospect key={u.id} prospect={u} />)}
              </div>
            )}
            <div style={{clear: 'both'}}></div>
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
      {text: _getFeat(TAG_TYPES.COMPANY), icon: <FontIcon className="material-icons" title="Company">supervisor_account</FontIcon>},
      {text: _getFeat(TAG_TYPES.LOCATION), icon: <FontIcon className="material-icons" title="Location">room</FontIcon>},
      {text: _getFeat(TAG_TYPES.COMMITMENT), icon: <FontIcon className="material-icons" title="Commitment">schedule</FontIcon>},
      {
        text: (score ? `(${score}) ` : '') + _(job.tags).filter({type: TAG_TYPES.SKILL}).map('text').join(', '),
        icon: <FontIcon className="material-icons" title="Tags">label</FontIcon>
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
            leftIcon={<FontIcon className="material-icons" title="Views">insert_chart</FontIcon>}
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
