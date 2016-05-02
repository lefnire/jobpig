import React from 'react';
import {
  CardHeader,
  CardText,
  CardActions,
  Paper,
  FloatingActionButton,
  FontIcon,
  RaisedButton,
  IconButton
} from 'material-ui';
import Auth from './Auth';
import Footer from '../Footer';
import _ from 'lodash';
import {constants, _ga, _fetch, setAnon, isSmall} from '../../helpers';
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
import smoothScroll from 'smoothscroll';
import load from 'load-script';

let variation = jobpig.env === 'production' && window.cxApi ? window.cxApi.chooseVariation() : 0;

export default class Front extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  registerAnon = () => {
    this.setState({user: {}}); // show 'seed tags' now; still loading from server
    window.onunload = () => _fetch('register/anon', {method: "DELETE"});
    _fetch('register/anon', {method: 'POST'}).then(user => {
      setAnon(user);
      this.setState({user, viewScores: !isSmall});
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
    //if (!this.scored) { // Experimenting with counting all scores real quick
      _ga.event('engagement', 'sample-thumb');
      //this.scored = true;
    //}
  };

  clickCTA = (ctaSource, action) => {
    _ga.event('engagement', 'cta:' + ctaSource);
    this.refs.auth.open(action);
  };

  onSeed = user => {
    _fetch('jobs/match').then(job => {
      this.setState({job, user, scoreCt: 0});
    });
  };

  renderJob = () => {
    let {user, job} = this.state;
    let content;

    if (!user) {
      content = (
        <div style={{position: 'relative'}}>
          <div style={{opacity: .5}}>
            <CardHeader
              title='Seeking Senior JavaScript Dev'
              subtitle={<span><u>Company, Inc</u> | <u>San Francisco, CA</u></span>}
              avatar='/sample-avatars/biz0.jpg'
            />
            <CardText>
              <p>Come work here <u>full-time</u>! We use <u>React</u>, <u>Node.js</u>, and <u>Postgres</u>. PTO, 401k, great insurance.</p>
            </CardText>
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
          <Button onClick={this.registerAnon} bsSize='large' bsStyle='success' className='cta-button' style={{position: 'absolute', bottom: 10, left: 10}}>Try It!</Button>
        </div>
      );
    } else if (_.isEmpty(user.tags)) {
      content = <Seedtags noModal={true} onSeed={this.onSeed} />;
    } else if (this.state.scoreCt > 4) {
      content = (
        <CardText>
          <h4>Ok, you get the concept. Let's get your scores into the database so you don't lose progress, shall we?</h4>
          <Button bsStyle="success" bsSize="lg" className="cta-button" onClick={() => this.clickCTA('persist-demo', AUTH_ACTIONS.REGISTER)}>Register</Button>
        </CardText>
      );
    } else {
      content = (
        <div>
          <CardText>
            <h4><a href={job.url} target="_blank">{job.title}</a></h4>
            <p style={{wordWrap: 'break-word'}}>
              {job.tags.map(t =>
                <span className="demo-tag">{t.text}</span>
              )}
            </p>

            <p>{striptags(job.description).slice(0, 1024)}{job.description.length > 1024 && '...'}</p>
          </CardText>
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
      <Paper zDepth={3} className="paper-modal">
        {content}
      </Paper>
    );
  };

  render() {
    let {user, viewScores} = this.state;
    let coupon = /coupon=([^&]*)/.exec(location.search);
    coupon = coupon && coupon[1];

    // A/B GA Experiments
    let orig = variation === 0,
      showArrow = variation === 1,
      ctaToContent = variation === 2;

    return (
      <div className="frontpage">

        <div className="jp-nav">
          <div>
            <h1 className='title'>Jobpig</h1>
            <div className="login">
              <RaisedButton label='Login' onTouchTap={() => this.clickCTA('login')}/>
            </div>
          </div>
        </div>

        <div className="jumbo" style={{height: window.innerHeight - (showArrow? 65 : 0)}}>
          <img src="Pig.png" className='pig'/>
          <div className="jumbo-right">
            <h2 className='subtitle'>Rate Jobs, Find Matches</h2>

            <Button
              bsStyle="success"
              bsSize="lg"
              className="get-started"
              onClick={() =>
                ctaToContent ? smoothScroll(document.getElementById('content-section'), 500)
                : this.clickCTA('get-started', AUTH_ACTIONS.REGISTER)
              }
            >
              Get Started
            </Button>
          </div>
        </div>

        {showArrow &&
          <div className="show-more">
            <FontIcon className="material-icons"
              style={{fontSize: 100, color: '#767676', cursor: 'pointer'}}
              onTouchTap={() => smoothScroll(document.getElementById('content-section'), 500)}
            >
              expand_more
            </FontIcon>
          </div>
        }

        <Grid fluid={true} id="content-section">
          <Row className="searchers">
            <Col md={6} xs={12} className="jp-content">
              <h3><span className="jp-role">SEARCHERS</span> Rate Jobs, Find Matches</h3>
              <p>Thumbs teach Jobpig your search preferences; your list becomes custom-tailored to your preferred <u>skills</u>, <u>location</u>, <u>companies</u>, <u>commitment</u>, and <u>remote preference</u>.</p>
              {_.get(user, 'tags[0]') && (
                viewScores ? (
                  <div>
                    <CardHeader
                      title='You'
                      subtitle='Description of your professional role'
                      avatar="/sample-avatars/person.jpg"
                    />
                    <CardText>
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
                    </CardText>
                  </div>
                ) : <Button onClick={()=>this.setState({viewScores:true})}>View Your Scores</Button>
              )}
            </Col>
            <Col md={6} xs={12}>
              {this.renderJob()}
            </Col>
          </Row>
          <Row className="employers">
            <Col md={6} xs={12}>
              <Paper zDepth={3} className="paper-modal">
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

                </Modal.Body>
                <Modal.Footer>
                  <Button bsStyle="success" bsSize="lg" className="cta-button" onClick={() => this.clickCTA('post-job', AUTH_ACTIONS.POST_JOB)}>Post a Job</Button>
                </Modal.Footer>
              </Paper>
            </Col>
            <Col md={6} xs={12} className="jp-content">
              <div>
                <h3><span className="jp-role">EMPLOYERS</span> Find Needles in The Haystack</h3>
                <p>View candidates for whom your job is a great match; and let matching users find <em>you</em>.</p>
                <ul>
                  <li>View / contact candidates who match your listing, sorted by score</li>
                  <li>Higher listing display priority for searchers</li>
                  <li>Listing analytics</li>
                  <li>
                    <span style={{textDecoration: 'line-through'}}>$99 for 30 days</span> Free post with social share!
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Grid>

        <Footer />

        <Auth ref='auth' coupon={coupon}/>
      </div>
    );
  }
}