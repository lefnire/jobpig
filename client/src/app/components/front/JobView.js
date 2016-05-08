// Allows viewing a single job; whether logged in or anonymous
import React, {Component} from 'react';
import {
  Card,
  CardText,
  CircularProgress,
  AppBar,
  RaisedButton,
} from 'material-ui';
import _ from 'lodash';
import Job from '../jobs/Job';
import {_fetch, constants, _ga, loggedIn} from '../../helpers';
import Footer from '../Footer';

export default class AnonJob extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    _fetch('job/' + this.props.params.id).then(job => {
      this.setState({job});
    });
  }

  render() {
    let {job} = this.state;
    if (!job) return null;
    job = <Job job={job} anon={true} />;

    if (loggedIn()) return job;

    return (
      <div className="app">
        <AppBar
          title='Jobpig'
          iconElementLeft={<a href="/"><img src="Pig.png" style={{width: 40}}/></a>}
        />
        {/*iconElementRight={<RaisedButton label="Register" onTouchTap={()=> window.location = '/'} />}*/}
        {job}

        <div className="jobview alert alert-success">
          <p>Jobpig is a matchmaking job board. Whether you're looking for a job or employees, find your perfect match with our algorithm!</p>
          <a className="btn btn-success btn-lg" href="/">Get Started</a>
        </div>
        <Footer />
      </div>
    );

  }
}
