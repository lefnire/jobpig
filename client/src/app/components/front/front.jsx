import React from 'react';
import mui from 'material-ui';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import Auth from './auth.jsx';
import FullWidthSection from './full-width-section.jsx';
import Footer from '../footer';
import {Colors, Typography} from 'material-ui/lib/styles';
import {constants} from '../../helpers';
const {AUTH_ACTIONS} = constants;

export default class Front extends React.Component {
  constructor() {
    super();
    this.state = {
      popOpen: false
    };
  }

  popOpen = event => {
    this.setState({
      popOpen: true,
      anchorEl: event.currentTarget,
    });
  };

  render(){
    let styles = {
      root: {
        backgroundColor: Colors.blueGrey500,
      },
      title: {
        color: Colors.grey50,
        fontWeight: Typography.fontWeightMedium,
      },
      ctaButtons: {
        display: 'flex',
        alignContent: 'space-between'
      },
      ctaButton: {
        flex: 1,
        margin: 10,
        height: '100px'
      },
      popover: {
        padding: 10,
      },
      a: {
        pointer: 'cursor'
      },
    };

    let fake = { onTouchTap: this.popOpen };

    let rightIconMenu = (
      <mui.IconMenu iconButtonElement={<mui.IconButton><MoreVertIcon /></mui.IconButton>}>
        <mui.MenuItem {...fake}>Apply</mui.MenuItem>
        <mui.MenuItem {...fake}>Like</mui.MenuItem>
        <mui.MenuItem {...fake}>Dislike</mui.MenuItem>
      </mui.IconMenu>
    );

    return (
      <div>

        {/* Github Ribbon (interfering with the pig)
          <a href="https://github.com/lefnire/jobpig"><img style={{position: 'absolute', top: 0, left: 0, border: 0}} src="https://camo.githubusercontent.com/c6625ac1f3ee0a12250227cf83ce904423abf351/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f6c6566745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_left_gray_6d6d6d.png" /></a>
        */}

        <FullWidthSection style={styles.root} className='root'>
          <div className='tagline' >
            <h1 style={styles.title} className='front-title'>Jobpig</h1>
            <h2 style={styles.title} className='front-subtitle'>Rate Jobs, Find Matches</h2>
          </div>
          <img src="Pig.png" className='pig' />
        </FullWidthSection>
        <FullWidthSection className='examples'>
          <mui.Card>
            <mui.CardTitle title='Rate job posts' />
            <mui.Divider />
            <mui.CardHeader
              title='Seeking Senior JavaScript Developer'
              subtitle='Company, Inc | San Francisco, CA'
              avatar="/sample-avatars/biz0.jpg"
              />
            <mui.CardText>
              <p>
                Come work for the coolest company on earth! We use <b>React</b>, React Native, <b>Node.js</b>/Express, <b>Postgres</b>. PTO, paid vacation, 401k, and an HTC Vive room for competitive produce-juggling.
              </p>
              <mui.FloatingActionButton {...fake}>
                <mui.FontIcon className="material-icons">thumb_up</mui.FontIcon>
              </mui.FloatingActionButton>
              &nbsp;&nbsp;
              <mui.FloatingActionButton {...fake}>
                <mui.FontIcon className="material-icons">thumb_down</mui.FontIcon>
              </mui.FloatingActionButton>
            </mui.CardText>
          </mui.Card>

          <br/>
          <mui.Card>
            <mui.CardTitle
              title='That adjusts scores'
              subtitle="Ratings teach Jobpig your search preferences."
            />
            <mui.Divider />
            <mui.CardText>
              <mui.List>
                {['React', 'Node', 'Postgres', 'San Francisco, CA', 'Company, inc.'].map(k => {
                  return <mui.ListItem key={'scores-example-' + k} primaryText={
                    <div><span className='plus-one'>+1</span> {k}</div>
                  } />
                })}
              </mui.List>
            </mui.CardText>
            <mui.CardTitle
              title='Filtering your job-hunt'
              subtitle='Scores train Jobpig to narrow down jobs tailored for your interests.'
              />
            <mui.Divider />
            <mui.CardText>
              <mui.List>
                {
                  [
                    {title:'Node.js, Postgres Backend Engineer', sub:'Medical Inc. | San Jose, CA'},
                    {title:'Python Machine Learning Expert', sub:'Singularity Ltd. | Boston, MA', disabled:true},
                    {title:'React + Flux Web/Mobile Developer', sub:'Agency LLC | Portland, OR'},
                    {title:'Backbone, Rails Full-Stack Dev', sub:'NotMyCup Co. | Austin, TX', disabled:true},
                  ].map((i,n)=>
                    <mui.ListItem
                      style={ i.disabled ? {textDecoration:'line-through', opacity:0.5} : {}}
                      leftAvatar={<mui.Avatar src={`/sample-avatars/biz${n+1}.jpg`} />}
                      primaryText={i.title}
                      secondaryText={i.sub}
                      rightIconButton={rightIconMenu}
                      key={'jobs-example-' + n}
                      />
                  )
                }
              </mui.List>
            </mui.CardText>
          </mui.Card>

          <br/>
          <mui.Card>
            <mui.CardTitle
              title="Employers, find those needles in the haystack"
              subtitle="View candidates for whom your job is a great match, based on searcher preferences. No more combing through profiles." />
            <mui.Divider />
            <mui.CardHeader
              title='Candidate'
              subtitle='Full-stack JavaScript Developer'
              avatar="/sample-avatars/person.jpg"
              />
            <mui.CardText>
              <p>
                "Candidate" matches your company by a score of <span style={{color:'green'}}>+10</span> on: <b>React</b>, <b>Node</b>, <b>Postgres</b>, <b>San Francisco, CA</b>.
              </p>
              <mui.RaisedButton label="Contact" {...fake} />
            </mui.CardText>
          </mui.Card>

          <div style={styles.ctaButtons}>
            <mui.RaisedButton style={styles.ctaButton} primary={true} label="Search Jobs" onTouchTap={()=>this.refs.auth.open(AUTH_ACTIONS.REGISTER)} />
            <mui.RaisedButton style={styles.ctaButton} primary={true} label="Post a Job" onTouchTap={()=>this.refs.auth.open(AUTH_ACTIONS.POST_JOB)} />
          </div>

        </FullWidthSection>
        <Footer />

        <Auth ref='auth' />

        <mui.Popover
          open={this.state.popOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.setState({popOpen: false})}
        >
          <div style={styles.popover}>
            This is a demo, register for the real deal.
          </div>
        </mui.Popover>

        <div className='login'>
          <mui.RaisedButton label='Login / Register' onTouchTap={()=>this.refs.auth.open()} />
        </div>
      </div>
    );
  }
}
