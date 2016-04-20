require("../www/main.scss");

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, Link, hashHistory} from 'react-router';

// Material UI
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin(); //Needed for onTouchTap, Can go away when react 1.0 release. Seehttps://github.com/zilverline/react-tap-event-plugin
window.React = React; //Needed for React Developer Tools
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  FontIcon,
  FlatButton,
  Card,
  CardHeader,
  CardText,
  CardTitle,
  AppBar,
} from 'material-ui';

const myTheme = getMuiTheme({
  palette: {
    accent1Color: '#414B82',
    primary1Color: '#272D4E'
  }
});

// Other
import {
  Grid, Row, Jumbotron, Col
} from 'react-bootstrap';
import Footer from '../app/components/Footer';
import _ from 'lodash';
import load from 'load-script';
import {_ga, setupGoogle} from '../app/helpers';
setupGoogle();

let hash = {};
let posts = _.times(4, i => {
  let post = require('./posts/' + i);
  post.id = i;
  hash[i] = post;
  return post;
}).reverse();

export default class Blog extends React.Component {
  componentWillMount() {
    _ga.pageview('/blog');
  }

  render(){
    return (
      <Grid fluid={true} className="frontpage blog">
        <Row>
          <AppBar
            title="Jobpig Blog - Musings on Jobs"
            iconElementLeft={<a href="/"><img src="/Pig.png" className='pig' /></a>}
          />
        </Row>

        <Row>
          <div style={{padding: 20}}>
            {this.props.children}
          </div>
        </Row>

        <Row>
          <Footer />
        </Row>

      </Grid>
    );
  }
}


class Entry extends React.Component {
  componentWillReceiveProps(nextProps) {
    this.updateContent(nextProps.params.id);
  }

  componentWillMount(){
    this.updateContent(this.props.params.id);
  }

  updateContent(id) {
    let post = hash[id];
    document.title = post.title + ' - Jobpig';
    this.setState({post});
    window.scrollTo(0, 0);
    _ga.pageview('/blog/' + id);

    // Go to www.addthis.com/dashboard to customize your tools
    load('https://s7.addthis.com/js/300/addthis_widget.js#pubid=lefnire', _.noop);
  }

  render() {
    if (!(this.state && this.state.post)) return
    let {post} = this.state;
    return (
      <div>
        <FlatButton
          label="Blog"
          linkButton={true}
          containerElement={<Link to="/" />}
          secondary={true}
          icon={<FontIcon className="material-icons">arrow_back</FontIcon>}
        />
        <Card>
          <CardTitle title={post.title} subtitle={post.date}/>
          <CardText className="content">
            <div className="content">
              {post.body}
            </div>
            <div className="addthis_sharing_toolbox"></div>
            <h3>Comment system coming soon</h3>
          </CardText>
        </Card>
      </div>
    );
  }
}

class Home extends React.Component {
  componentWillMount() {
    document.title = "Jobpig Blog";
  }

  render(){
    return (
      <div>
        {posts.map(post =>
          <Card key={post.id}>
            <CardTitle title={<Link to={'/' + post.id}>{post.title}</Link>} subtitle={post.date} />
            <CardText><div className="content">{post.teaser}</div></CardText>
          </Card>
        )}
      </div>
    );
  }
}

class Main extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={myTheme}>
        <Router history={hashHistory}>
          <Route path="/" component={Blog}>
            <IndexRoute component={Home} />
            <Route path="/:id" component={Entry} />
          </Route>
        </Router>
      </MuiThemeProvider>
    );
  }
};

ReactDOM.render(<Main/>, document.getElementById('blog'));