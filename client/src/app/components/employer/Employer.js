import React from 'react';
import {
  RaisedButton,
  Card,
  CardText,
  CardTitle,
  CardHeader,
} from 'material-ui';
import CreateJob from './Create';
import Job from '../jobs/Job';
import _ from 'lodash';
import {_fetch, constants, me, _ga} from '../../helpers';
import load from 'load-script';
const {TAG_TYPES} = constants;

export default class Employer extends React.Component {
  constructor(){
    super();
    this.state = {jobs: []};
    this._refresh();

    me().then(profile => {
      //http://www.addthis.com/academy/the-addthis_share-variable/
      window.addthis_share = {
        url: `https://jobpigapp.com?uid=${profile.id}`,
        title: `Just posted on on Jobpig, a matchmaking job board.`,
        //description: "My Description"
      };
    });
  }

  componentWillMount() {
    this._setupAddthis();
  }

  componentWillUnmount() {
    this._teardownAddthis();
  }

  _setupAddthis = () => {
    // Hacky callback for post-social-share. Started using AddThis callbacks (http://www.addthis.com/academy/addthis-javascript-events/),
    // but there's no solution for "after shared" or even "share window closed"; only "share window opened" (addthis.menu.share).
    // My solution uses http://stackoverflow.com/a/6341534/362790 & http://stackoverflow.com/a/31752385/362790
    // Also, this breaks when addthis loaded from index.html script tag

    let shareWindow, service;
    window._open = window.open;
    window.open = (url,name,params) => {
      clearInterval(this.timer);
      shareWindow = window._open(url,name,params); // you can store names also
      this.timer = setInterval(() => {
        if (!(shareWindow && shareWindow.closed)) return;
        _fetch('user/share/post', {method: "POST"}).then(profile => this.setState({free_jobs: profile.free_jobs}));
        _ga.event('engagement', 'share', service);
        clearInterval(this.timer);
      }, 750);
    };
    // Go to www.addthis.com/dashboard to customize your tools
    load('https://s7.addthis.com/js/300/addthis_widget.js#pubid=lefnire', (err, script) => {
      if (err) throw err;
      addthis.addEventListener('addthis.menu.share', evt => service = evt.data.service);
      this.forceUpdate();
    });
  };
  _teardownAddthis = () => {
    clearInterval(this.timer);
    window.open = window._open;
  };

  renderJobs = () => {
    return this.state.jobs.map((job, i) => (
      <Job job={job} key={job.id} isEmployer={true} />
    ));
  };

  renderEmpty = () => {
    let {free_jobs} = this.state;

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
    }

    return (
      <div className="padded">
        <Card>
          <CardHeader>
            <RaisedButton label="Post Job" primary={true} onTouchTap={()=> global.jobpig.createJob.open()} />
          </CardHeader>
          <CardText>
            <ul className="empty-text">
              <li>View / contact candidates who match your listing, sorted by score</li>
              <li>Higher listing display priority for searchers</li>
              <li>Listing analytics</li>
              <li>
                <span style={{textDecoration: 'line-through'}}>($99 for 30 days)</span>&nbsp;
                {
                  free_jobs? <b>{free_jobs} Free Post{free_jobs>1? 's': ''}!</b>
                    : <b>Free post with social share</b>
                }
                {/* Go to www.addthis.com/dashboard to customize your tools */}
                <div className="addthis_sharing_toolbox"></div>
              </li>
            </ul>
          </CardText>
        </Card>
        <br/>

        <Job job={fakeJob} style={{opacity:0.5}} isEmployer={true} />
      </div>
    );
  };

  render() {
    let isEmpty = this.state.jobs.length === 0;

    return (
      <div>
        <CreateJob ref={c => global.jobpig.createJob = c} onCreate={this._refresh} free_jobs={this.state.free_jobs} />
        {isEmpty? this.renderEmpty() : this.renderJobs()}
      </div>
    )
  }

  _refresh = () => {
    Promise.all([
      _fetch('jobs/mine', {method: "GET"}),
      me()
    ]).then(vals => this.setState({
      jobs: vals[0],
      free_jobs: vals[1].free_jobs
    }));
  }
}
