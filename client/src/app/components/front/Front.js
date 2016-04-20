import React from 'react';
import {
  CardHeader,
  Paper,
  FloatingActionButton,
  FontIcon,
  RaisedButton,
} from 'material-ui';
import Auth from './Auth';
import Footer from '../Footer';
import _ from 'lodash';
import {Colors, Typography} from 'material-ui/lib/styles';
import {constants, _ga} from '../../helpers';
const {AUTH_ACTIONS} = constants;

import {
  Grid,
  Row,
  Col,
  Modal,
  Button,
  Jumbotron,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';

export default class Front extends React.Component {
  constructor() {
    super();
    this.state = {
      jobs: allJobs,
      scores: {}
    };
  }

  score = (job, score) => {
    if (!this.scored) {
      _ga.event('engagement', 'sample-thumb');
      this.scored = true;
    }
    let {scores} = this.state;
    job.tags.concat(job.location).concat(job.company).forEach(t => {
      if (!scores[t]) scores[t] = 0;
      scores[t] += score;
    });
    this.setState({
      scores,
      jobs: this.state.jobs.slice(1),
    });
  };

  render(){
    let {scores} = this.state;
    let job = this.state.jobs[0];
    let coupon = /coupon=([^&]*)/.exec(location.search);
    coupon = coupon && coupon[1];

    return (
      <Grid fluid={true} className="frontpage">

        {/* Github Ribbon (interfering with the pig)
          <a href="https://github.com/lefnire/jobpig"><img style={{position: 'absolute', top: 0, left: 0, border: 0}} src="https://camo.githubusercontent.com/c6625ac1f3ee0a12250227cf83ce904423abf351/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_gray_6d6d6d.png" /></a>
        */}

        <Row>
          <Jumbotron className='top-jumbo'>
            <div className='tagline' >
              <h1 className='title'>Jobpig</h1>
              <h2 className='subtitle'>Rate Jobs, Find Matches</h2>
            </div>
            <img src="Pig.png" className='pig' />
          </Jumbotron>
        </Row>

        <Row className="searchers">
          <Col xs={12} md={6} className="jp-content">
            <div>
              <h3><span className="jp-role">SEARCHERS</span> Rate Jobs, Find Matches</h3>
              <p>Thumbs teach Jobpig your search preferences; your list becomes custom-tailored to your preferred <u>skills</u>, <u>location</u>, <u>companies</u>, <u>commitment</u>, and <u>remote preference</u>.</p>
              {_.isEmpty(scores) ? <small>(Click a thumb to see sample)</small> : (
                <Modal.Body>
                  <CardHeader
                    title='You'
                    subtitle='Full-stack JavaScript Developer'
                    avatar="/sample-avatars/person.jpg"
                  />
                  {_.isEmpty(scores) ? (
                    <p>(Click one of those thumbs to see what we mean)</p>
                  ) : (
                    <Row className="sample-scores">
                      <Col md={6} xs={6}>
                        <ul>
                          {_(scores).map((v,k) => ({k,v})).filter(i => i.v > 0).map(i => (
                            <li key={i.k} className='score-up'>+{i.v} {i.k}</li>
                          )).value()}
                        </ul>
                      </Col>
                      <Col md={6} xs={6}>
                        <ul>
                          {_(scores).map((v,k) => ({k,v})).filter(i => i.v < 0).map(i => (
                            <li key={i.k} className='score-down'>{i.v} {i.k}</li>
                          )).value()}
                        </ul>
                      </Col>
                    </Row>
                  )}
                </Modal.Body>
              )}
            </div>
          </Col>
          <Col xs={12} md={6}>
            <Paper zDepth={3} style={{margin: 10, padding: 10, border: '1px solid #999', borderRadius: 5}}>
              {job ? (
                <Modal.Header>
                  <CardHeader
                    title={job.title}
                    subtitle={<span><u>{job.company}</u> | <u>{job.location}</u></span>}
                    avatar={job.avatar}
                  />
                  <br/>
                  <div>{job.description}</div>
                </Modal.Header>
              ) : (
                  <h5>This was sample content, register for the real deal.</h5>
              )}

              {job ? (
                <Modal.Footer>
                  <FloatingActionButton onTouchTap={() => this.score(job, 1)} className={_.isEmpty(scores) ? 'flashing-button' : ''}>
                    <FontIcon className="material-icons">thumb_up</FontIcon>
                  </FloatingActionButton>
                  &nbsp;&nbsp;
                  <FloatingActionButton onTouchTap={() => this.score(job, -1)}>
                    <FontIcon className="material-icons">thumb_down</FontIcon>
                  </FloatingActionButton>
                </Modal.Footer>
              ) : (
                <Modal.Footer>
                  <RaisedButton onTouchTap={() => this.refs.auth.open()} primary={true} label="Register" />
                </Modal.Footer>
              )}
            </Paper>
          </Col>
        </Row>

        <Row className="employers">
          <Col xs={12} md={6}>
            <div className="static-modal">
              <Paper zDepth={3} style={{margin: 10, padding: 10, border: '1px solid #999', borderRadius: 5}}>
                <Modal.Header>
                  <Modal.Title>My Job Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>My company is seeking a <u>full-time</u> <u>JavaScript</u> ninja in <u>San Francisco, CA</u></p>
                  <hr/>
                  <h4>Candidate Matches</h4>

                  <ListGroup>
                    <ListGroupItem>
                      <Row>
                        <Col md={7} xs={7}>
                          <CardHeader
                            title="Mrs. Candidate"
                            subtitle="Full-stack JavaScript Developer"
                            avatar="/sample-avatars/person.jpg"
                          />
                        </Col>
                        <Col md={5} xs={5}>
                          <ul style={{listStyle: 'none', padding: 0}}>
                            <li className="sample-score-up">+3 JavaScript</li>
                            <li className="sample-score-up">+3 Full-time</li>
                            <li className="sample-score-up">+3 San Francisco</li>
                          </ul>
                          <RaisedButton label="Contact" />
                        </Col>
                      </Row>
                    </ListGroupItem>
                    <ListGroupItem header="Candidate 2">Candidates are sorted by match score</ListGroupItem>
                    <ListGroupItem header="Candidate 3">...</ListGroupItem>
                  </ListGroup>

                  <RaisedButton primary={true} onTouchTap={()=>this.refs.auth.open(AUTH_ACTIONS.POST_JOB)} label="Post a Job" />
                </Modal.Body>
              </Paper>
            </div>
          </Col>
          <Col xs={12} md={6} className="jp-content">
            <div>
              <h3><span className="jp-role">EMPLOYERS</span> Find Needles in The Haystack</h3>
              <p>View candidates for whom your job is a great match; and let matching users find <em>you</em>.</p>
              <ul>
                <li>View / contact candidates who match your listing, sorted by score</li>
                <li>Higher listing display priority for searchers</li>
                <li>Listing analytics</li>
                <li><span style={{textDecoration: 'line-through'}}>$99 for 30 days</span> Free post with social share!</li>
              </ul>
            </div>
          </Col>
        </Row>

        <Row>
          <Footer />
        </Row>

        <Auth ref='auth' coupon={coupon} />

        <div className='login'>
          <RaisedButton label='Login / Register' onTouchTap={()=>this.refs.auth.open()} />
        </div>
      </Grid>
    );
  }
}

let allJobs = [{
  title: 'Seeking Senior JavaScript Dev',
  company: 'Company, Inc',
  location: 'San Francisco, CA',
  avatar: '/sample-avatars/biz0.jpg',
  tags: ['React', 'Node.js', 'Postgres', 'Full-time'],
  description: <p>Come work here <u>full-time</u>! We use <u>React</u>, <u>Node.js</u>, and <u>Postgres</u>. PTO, 401k, great insurance.</p>
}, {
  title:'Node.js, Postgres Backend Engineer',
  company:'Medical Inc.',
  location: 'Remote',
  avatar: '/sample-avatars/biz1.jpg',
  tags: ['Node.js', 'Postgres', 'Contract'],
  description: <p>Bla bla bla <u>Contract</u>, <u>Node.js</u>, <u>Postgres</u></p>
}, {
  title:'Python Machine Learning Expert',
  company:'Singularity Ltd.',
  location: 'Boston, MA',
  avatar: '/sample-avatars/biz2.jpg',
  tags: ['Python', 'Machine Learning', 'Part-time'],
  description: <p>Bla bla bla <u>Part-time</u>, <u>Python</u>, <u>Machine Learning</u></p>
}, {
  title:'React + Flux Web/Mobile Developer',
  company:'Agency LLC',
  location: 'Portland, OR',
  avatar: '/sample-avatars/biz3.jpg',
  tags: ['React', 'Mobile'],
  description: <p>Bla bla bla <u>React</u>, <u>Mobile</u></p>
}, {
  title:'Ember, Rails Full-Stack Dev',
  company:'NotMyCup Co.',
  location: 'Austin, TX',
  avatar: '/sample-avatars/biz4.jpg',
  tags: ['Ember', 'Rails'],
  description: <p>Bla bla bla <u>Ember</u>, <u>Rails</u></p>
}];