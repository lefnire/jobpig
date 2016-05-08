import React from 'react';
import {
  RaisedButton,
  Card,
  CardText,
  CardTitle,
  CardHeader,
  FlatButton,
} from 'material-ui';
import Job from '../jobs/Job';
import _ from 'lodash';
import {_fetch, me, getTags, constants, filterOptions, _ga, isSmall} from '../../helpers';
const {TAG_TYPES} = constants;
import load from 'load-script';
import Formsy from 'formsy-react';
import {
  FormsyText,
  FormsyCheckbox
} from 'formsy-material-ui/lib';
import Select from 'react-select';
import StripeCheckout from 'react-stripe-checkout';
import Error from '../Error';
import {
  Modal,
  Button
} from 'react-bootstrap';

let stripeRef, _open, timer;

class ShareModal extends React.Component {
  constructor(){
    super();
    this.state = {open: false};
  }
  open = () => {
    this.setState({open: true});
    this._setupAddthis();
  };
  close = () => {
    this._teardownAddthis();
    this.setState({open: false});
  };

  _setupAddthis = () => {
    // Hacky callback for post-social-share. Started using AddThis callbacks (http://www.addthis.com/academy/addthis-javascript-events/),
    // but there's no solution for "after shared" or even "share window closed"; only "share window opened" (addthis.menu.share).
    // My solution uses http://stackoverflow.com/a/6341534/362790 & http://stackoverflow.com/a/31752385/362790
    // Also, this breaks when addthis loaded from index.html script tag

    let shareWindow, service;
    _open = window.open;
    window.open = (url,name,params) => {
      clearInterval(timer);
      shareWindow = _open(url,name,params); // you can store names also
      timer = setInterval(() => {
        if (!(shareWindow && shareWindow.closed)) return;
        _fetch('user/share/post', {method: "POST"}).then(this.props.onShare);
        _ga.event('engagement', 'share', service);
        clearInterval(timer);
      }, 750);
    };
    // Go to www.addthis.com/dashboard to customize your tools
    load('https://s7.addthis.com/js/300/addthis_widget.js#pubid=lefnire', (err, script) => {
      if (err) throw err;
      addthis.addEventListener('addthis.menu.share', evt => service = evt.data.service);
    });
  };
  _teardownAddthis = () => {
    clearInterval(timer);
    if (_open) window.open = _open;
  };

  render() {
    let {open} = this.state;
    return (
      <Modal show={open} onHide={this.close} bsSize="large" animation={!isSmall}>
        <Modal.Header>
          <Modal.Title>Share socially and this post is free!</Modal.Title>
          <p>Click on a sharing button below. If you prefer to pay ($99 for a 30 day post), click the "Pay with Card" button.</p>
        </Modal.Header>
        <Modal.Body className="share-modal">
          <div>
            <div className="addthis_sharing_toolbox"></div>
            <Button bsSize="lg" bsStyle="primary" onClick={() => stripeRef.onClick()}>Pay with Card</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default class Employer extends React.Component {
  constructor(){
    super();
    this.state = {
      jobs: [],
      open: false,
      canSubmit: false
    };
  }

  componentWillMount() {
    global.jobpig.createJob = this;
    this.refresh();
  }

  renderJobs = () => {
    return (
      <div>
        {this.state.jobs.map((job, i) => (
          <Job job={job} key={job.id} isEmployer={true} style={{marginBottom: 15}}/>
        ))}
      </div>
    );
  };

  renderPerks = () => {
    let {free_jobs} = this.state;
    return (
      <Card style={{marginBottom: 15}}>
        <CardText>
          <RaisedButton label="Post Job" primary={true} onTouchTap={()=> global.jobpig.createJob.open()} />
        </CardText>
        <CardText>
          <ul className="empty-text">
            <li>View / contact candidates who match your listing, sorted by score</li>
            <li>Higher listing display priority for searchers</li>
            <li>Listing analytics</li>
            {free_jobs === -1 ? (
              <li>$99 for 30 days</li>
            ) : (
              <li>
                <span style={{textDecoration: 'line-through'}}>($99 for 30 days)</span>&nbsp;
                {
                  free_jobs? <b>{free_jobs} Free Post{free_jobs>1? 's': ''}!</b>
                    : <span><b>Free post with social share</b></span>
                }
              </li>
            )}
          </ul>
        </CardText>
      </Card>
    );
  };

  renderSample = () => {
    let fakeJob = {
      title: 'Your Job Title',
      //description: `Post your job here. Users will find you if their preferences match your job's attributes; and vice versa. $50 for 30days, and your post will be promoted to matching users!`,
      //description: `Seeking Full-time JavaScript and Ruby on Rails developer to join our awesome San Francisco office!`,
      views: 25,
      likes: 10,
      dislikes: 5,
      tags: [
        {text: "Your Company", type: TAG_TYPES.COMPANY},
        {text: "San Francisco, CA", type: TAG_TYPES.LOCATION},
        {text: "Full-time", type: TAG_TYPES.COMMITMENT},
        {text: "Ruby on Rails"},
        {text: "JavaScript"},
        {text: "PostgreSQL"}
      ].map((t,key) => _.assign({key, type: TAG_TYPES.SKILL}, t)),
      users: [{
        id: 1,
        fullname: 'Tyler Renelle',
        score: 10,
        tags: [{key: 'PostgreSQL'},{key: 'JavaScript'},{key: 'Full-time'}],
        pic: 'http://www.gravatar.com/avatar/ff2dd194f7faa850a0410f93735280b8',
        bio: `Full Stack JavaScript developer, 10 years in web & mobile. Focused on Node, React / React Native, and Angular / Ionic. Creator of HabitRPG, a startup begun on Kickstarter which now has 800k+ users. Built an enterprise PDF-creation service employed by 1.5k sites, and websites for clients such as Adidas, BigFix, and UCSF. Currently obsessed with machine learning - bonafide singularitarian here.`
      }]
    };

    return (
      <Job job={fakeJob} style={{opacity:0.5}} isEmployer={true} />
    );
  };

  render() {
    let {jobs, open} = this.state;
    if (open)
      return this.renderForm();
    return (
      <div className="padded">
        {this.renderPerks()}
        {_.isEmpty(jobs) && this.renderSample()}
        {this.renderJobs()}
      </div>
    );
  }

  refresh = (force) => {
    Promise.all([
      _fetch('jobs/mine', {method: "GET"}),
      me(force)
    ]).then(vals => {
      this.setState({
        jobs: vals[0],
        free_jobs: vals[1].free_jobs
      });
      window.addthis_share = {
        url: `https://jobpigapp.com?uid=${vals[1].id}`,
        title: `I'm posting a job on Jobpig, a candidate matchmaking tool!`,
        //description: "My Description"
      };
    });
  };

  // --------------- Create Job

  renderForm() {
    return (
      <div>
        <ShareModal ref="share" onShare={this.onShare} />
        <Modal.Body>
          <StripeCheckout
            ref={c => {if (c) stripeRef = c}}
            token={this.onToken}
            stripeKey="<nconf:stripe:public>"
            amount={9900}>
            <span>{/* StripeCheckout wants to render its own button unless we give it an element; but we don't want to render a button */}</span>
          </StripeCheckout>

          <Error error={this.state.error} />

          <Formsy.Form
            ref="form"
            onValid={() => this.setState({canSubmit: true})}
            onInvalid={() => this.setState({canSubmit: false})}
            onValidSubmit={this.submit}
          >
            <FormsyText
              name='title'
              required
              hintText="Job title (required)"
              fullWidth={true}
            />
            <FormsyText
              name='company'
              required
              hintText="Company (required)"
              fullWidth={true}
            />
            <FormsyText
              name='url'
              hintText="External job URL (optional)"
              fullWidth={true}
              validations="isUrl"
              validationError="Enter a valid URL"

            />
            <Select.Async
              placeholder="Skills (required)"
              multi={true}
              value={this.state.tags}
              loadOptions={() => getTags().then(options => ({options})) }
              onChange={this.changeTags}
              noResultsText="Start typing"
              filterOptions={filterOptions(true)}
            />
            <p>Skills are how your job gets found. Enter as many of the most important skills required for this position. 5-10 items is a good amount, but if you can only think of one that's OK.</p>
            <FormsyCheckbox
              name='remote'
              label="Remote"
            />
            <Select.Async
              placeholder="Location"
              value={this.state.location}
              loadOptions={() => getTags(TAG_TYPES.LOCATION).then(options => ({options})) }
              onChange={this.changeLocation}
              noResultsText="Start typing"
              filterOptions={filterOptions(true)}
            />
            <FormsyText
              name='description'
              required
              hintText="Job description (required)"
              multiLine={true}
              rows={3}
              fullWidth={true}
            />

          </Formsy.Form>
        </Modal.Body>
        <Modal.Footer style={{border: 'none'}}>
          <FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>
          <RaisedButton label="Submit" primary={true} disabled={false && !this.state.canSubmit} onTouchTap={() => this.refs.form.submit()} />
        </Modal.Footer>
      </div>
    )
  }

  changeLocation = location => {
    if (location.create)
      location.label = location.label.replace(/^Add /, '');
    this.setState({location});
  };
  changeTags = tags => {
    let entered = _.last(tags);
    if (entered && entered.create)
      entered.label = entered.label.replace(/^Add /, '');
    this.setState({tags});
  };

  open = () => {
    _ga.pageview('modal:create-job');
    this.setState({open: true});
  };
  close = () => {
    _ga.pageview();
    this.setState({open: false});
  };

  submit = body => {
    let {location, tags, free_jobs} = this.state;
    body.location = location && location.label;
    body.tags = tags && _.map(tags, 'label');
    this.body = body; // save it away in case we need to come back after modal
    _fetch('jobs', {method:"POST", body: this.body})
      .then(created => {
        // they had free jobs
        if (created.pending === false)
          return this.onPosted();

        this.job_id = created.id;

        // They don't have free job; but can get one with a social share
        if (free_jobs === 0) {
          return this.refs.share.open();
        }

        // Neither above
        stripeRef.onClick();
      })
      .catch(error => this.setState({error}));
  };

  onToken = token => {
    // POST server/payments {token: token}
    _fetch('payments', {method: "POST", body:{token, job_id: this.job_id}})
      .then(() => this.onPosted()).catch(error => this.setState({error}));
  };

  onShare = () => {
    _fetch('jobs', {method: "POST", body: {job_id: this.job_id}}).then(this.onPosted);
  };

  onPosted = () => {
    this.refresh(true);
    this.job_id = null;
    _ga.event('revenue','purchase');
    this.refs.share.close(); // must come before this.close()
    _.defer(() => {
      this.close();
      global.jobpig.alerts.alert('Payment success, posting job now.');
    });
  };

}
