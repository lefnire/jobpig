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
import {constants, _ga, _fetch, setAnon} from '../../helpers';
const {AUTH_ACTIONS, FILTERS} = constants;
import Seedtags from '../SeedTags';
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
import striptags from 'striptags';

export default class Front extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  registerAnon = () => {
    window.onunload = () => _fetch('register/anon', {method: "DELETE"});
    _fetch('register/anon', {method: 'POST'}).then(user => {
      setAnon(user);
      this.setState({user});
    });
  };

  score = (id, status) => {
    _fetch(`jobs/${id}/${status}`, {method: "POST"})
      .then(body => {
        this.setState({
          job: body.job,
          user: body.user,
          scoreCt: this.state.scoreCt + 1
        });
      });
    if (!this.scored) {
      _ga.event('engagement', 'sample-thumb');
      this.scored = true;
    }
  };

  onSeed = user => {
    _fetch('jobs/match').then(job => {
      this.setState({job, user, scoreCt: 0});
    });
  };

  renderJob = () => {
    let {user, job} = this.state;
    let content;

    console.log({user});

    if (!user) {
      content = (
        <div>
          <div style={{opacity: .5}}>
            <Modal.Header>
              <CardHeader
                title='Seeking Senior JavaScript Dev'
                subtitle={<span><u>Company, Inc</u> | <u>San Francisco, CA</u></span>}
                avatar='/sample-avatars/biz0.jpg'
              />
              <div>
                <p>Come work here <u>full-time</u>! We use <u>React</u>, <u>Node.js</u>, and <u>Postgres</u>. PTO, 401k, great insurance.</p>
              </div>
            </Modal.Header>
            <Modal.Footer>
              <FloatingActionButton disabled={true}>
                <FontIcon className="material-icons">thumb_up</FontIcon>
              </FloatingActionButton>
              &nbsp;&nbsp;
              <FloatingActionButton disabled={true}>
                <FontIcon className="material-icons">thumb_down</FontIcon>
              </FloatingActionButton>
            </Modal.Footer>
          </div>
          <Button onClick={this.registerAnon} bsSize='large' bsStyle='success' style={{position: 'absolute', bottom: 35, left: 45, padding: '15px 30px'}}>Try It!</Button>
        </div>
      );
    } else if (_.isEmpty(user.tags)) {
      content = <Seedtags noModal={true} onSeed={this.onSeed} />;
    } else if (this.state.scoreCt > 4) {
      content = (
        <div>
          <Modal.Header>
            <CardHeader
              title="This was a demo (with real content); you should register to continue, so that your preferences will be saved to the database!"
            />
          </Modal.Header>
          <Modal.Footer>
            <RaisedButton onTouchTap={() => this.refs.auth.open(AUTH_ACTIONS.REGISTER)} primary={true} label="Register"/>
          </Modal.Footer>
        </div>
      );
    } else {
      content = (
        <div>
          <Modal.Body>
            <h4><a href={job.url} target="_blank">{job.title}</a></h4>
            <h5>Tags: {_.map(job.tags, 'text').join(', ')}</h5>

            <p>{striptags(job.description).slice(0, 1024)}{job.description.length > 1024 && '...'}</p>
          </Modal.Body>
          <Modal.Footer>
            <FloatingActionButton onTouchTap={() => this.score(job.id, FILTERS.LIKED)}>
              <FontIcon className="material-icons">thumb_up</FontIcon>
            </FloatingActionButton>
            &nbsp;&nbsp;
            <FloatingActionButton onTouchTap={() => this.score(job.id, FILTERS.DISLIKED)}>
              <FontIcon className="material-icons">thumb_down</FontIcon>
            </FloatingActionButton>
          </Modal.Footer>
        </div>
      );
    }

    return (
      <Paper zDepth={3} style={{margin: 10, padding: 10, border: '1px solid #999', borderRadius: 5}}>
        {content}
      </Paper>
    );
  };

  render() {
    let {user} = this.state;
    let coupon = /coupon=([^&]*)/.exec(location.search);
    coupon = coupon && coupon[1];

    return (
      <Grid fluid={true} className="frontpage">

        {/* Github Ribbon (interfering with the pig)
         <a href="https://github.com/lefnire/jobpig"><img style={{position: 'absolute', top: 0, left: 0, border: 0}} src="https://camo.githubusercontent.com/c6625ac1f3ee0a12250227cf83ce904423abf351/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_gray_6d6d6d.png" /></a>
         */}

        <Row>
          <Jumbotron className='top-jumbo'>
            <div className='tagline'>
              <h1 className='title'>Jobpig</h1>
              <h2 className='subtitle'>Rate Jobs, Find Matches</h2>
            </div>
            <img src="Pig.png" className='pig'/>
          </Jumbotron>
        </Row>

        <Row className="searchers">
          <Col xs={12} md={6} className="jp-content">
            {_.get(user, 'tags[0]') ? (
              <Modal.Body>
                <CardHeader
                  title='You'
                  subtitle='Description of your professional role'
                  avatar="/sample-avatars/person.jpg"
                />
                <Row className="sample-scores">
                  <Col md={6} xs={6}>
                    <ul>
                      {user.tags.filter(t => t.score > 0).map(tag => (
                        <li key={tag.id} className='score-up'>+{tag.score} {tag.text}</li>
                      ))}
                    </ul>
                  </Col>
                  <Col md={6} xs={6}>
                    <ul>
                      {user.tags.filter(t => t.score < 0).map(tag => (
                        <li key={tag.id} className='score-down'>{tag.score} {tag.text}</li>
                      ))}
                    </ul>
                  </Col>
                </Row>
              </Modal.Body>
            ) : (
              <div>
                <h3><span className="jp-role">SEARCHERS</span> Rate Jobs, Find Matches</h3>
                <p>Thumbs teach Jobpig your search preferences; your list becomes custom-tailored to your preferred <u>skills</u>,
                  <u>location</u>, <u>companies</u>, <u>commitment</u>, and <u>remote preference</u>.</p>
              </div>
            )}
          </Col>
          <Col xs={12} md={6}>
            {this.renderJob()}
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
                          <RaisedButton label="Contact"/>
                        </Col>
                      </Row>
                    </ListGroupItem>
                    <ListGroupItem header="Candidate 2">Candidates are sorted by match score</ListGroupItem>
                    <ListGroupItem header="Candidate 3">...</ListGroupItem>
                  </ListGroup>

                  <RaisedButton primary={true} onTouchTap={()=>this.refs.auth.open(AUTH_ACTIONS.POST_JOB)}
                                label="Post a Job"/>
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
                <li><span style={{textDecoration: 'line-through'}}>$99 for 30 days</span> Free post with social share!
                </li>
              </ul>
            </div>
          </Col>
        </Row>

        <Row>
          <Footer />
        </Row>

        <Auth ref='auth' coupon={coupon}/>

        <div className='login'>
          <RaisedButton label='Login / Register' onTouchTap={()=>this.refs.auth.open()}/>
        </div>
      </Grid>
    );
  }
}