import React from 'react';
import mui from 'material-ui';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import Auth from './auth.jsx';
import FullWidthSection from '../material-ui-docs/docs/src/app/components/full-width-section.jsx';
let { Mixins, Styles } = require('material-ui');
let { StylePropable, StyleResizable } = Mixins;
let { Colors, Spacing, Typography } = Styles;
let ThemeManager = new Styles.ThemeManager().getCurrentTheme();

export default React.createClass({
  mixins: [StylePropable, StyleResizable],

  _getStyles(){

    let styles = {
      root: {
        backgroundColor: Colors.blueGrey500,
        overflow: 'hidden',
      },
      tagline: {
        margin: '16px auto 0 auto',
        textAlign: 'center',
        maxWidth: 575,
      },
      examples: {
        margin: '-110px auto 0 auto',
        maxWidth: '1204px'
      },
      label: {
        color: ThemeManager.palette.primary1Color,
      },
      h1: {
        color: Colors.darkWhite,
        fontWeight: Typography.fontWeightLight,
      },
      h2: {
        fontSize: 20,
        lineHeight: '28px',
        paddingTop: 19,
        marginBottom: 13,
        letterSpacing: 0,
      },
      nowrap: {
        whiteSpace: 'nowrap'
      },
      taglineWhenLarge: {
        marginTop: 32
      },
      h1WhenLarge: {
        fontSize: 56
      },
      h2WhenLarge: {
        fontSize: 24,
        lineHeight: '32px',
        paddingTop: 16,
        marginBottom: 12,
      }
    };

    styles.h2 = this.mergeStyles(styles.h1, styles.h2);

    if (this.isDeviceSize(StyleResizable.statics.Sizes.LARGE)) {
      styles.tagline = this.mergeStyles(styles.tagline, styles.taglineWhenLarge);
      styles.h1 = this.mergeStyles(styles.h1, styles.h1WhenLarge);
      styles.h2 = this.mergeStyles(styles.h2, styles.h2WhenLarge);
    }

    return styles;
  },

  render(){
    var styles = this._getStyles();
    var rightIconMenu = (
      <mui.IconMenu iconButtonElement={<mui.IconButton><MoreVertIcon /></mui.IconButton>}>
        <mui.MenuItem>Apply</mui.MenuItem>
        <mui.MenuItem>Like</mui.MenuItem>
        <mui.MenuItem>Dislike</mui.MenuItem>
      </mui.IconMenu>
    );

    return (
      <div>
        <Auth ref='auth' />

        <mui.AppBar
          iconElementRight={
            <mui.RaisedButton label='Login / Register' onTouchTap={()=>this.refs.auth.show()} />
          }
          iconElementLeft={<span />}
          />
        <FullWidthSection style={styles.root}>
          <div style={styles.tagline}>
            <h1 style={styles.h1}>JobSeed</h1>
            <h2 style={styles.h2}>Find jobs tailored to you.</h2>
          </div>
        </FullWidthSection>
        <FullWidthSection style={styles.examples}>
          <mui.Card>
            <mui.CardTitle title='Rate job posts' />
            <mui.ListDivider />
            <mui.CardHeader
              title='Seeking Senior JavaScript Developer'
              subtitle='Company, Inc | San Francisco, CA'
              avatar="http://lorempixel.com/100/100/technics/10"
              />
            <mui.CardText>
              <p>
                Come work for the coolest company on earth! We use <b>React</b>, React Native, <b>Node.js</b>/Express, <b>Postgres</b>. PTO, paid vacation, 401k, and an HTC Vive room for competitive produce-juggling.
              </p>
              <mui.FloatingActionButton secondary={true}>
                <mui.FontIcon className="material-icons">thumb_up</mui.FontIcon>
              </mui.FloatingActionButton>
              &nbsp;&nbsp;
              <mui.FloatingActionButton secondary={true}>
                <mui.FontIcon className="material-icons">thumb_down</mui.FontIcon>
              </mui.FloatingActionButton>
            </mui.CardText>
          </mui.Card>

          <br/>
          <mui.Card>
            <mui.CardTitle title='That adjusts scores' />
            <mui.ListDivider />
            <mui.CardText>
              <mui.List>
                {['React', 'Node', 'Postgres', 'San Francisco, CA', 'Company, inc.'].map(k => {
                  return <mui.ListItem primaryText={
                    <div><span style={{fontWeight:'bold', color:'green'}}>+1</span> {k}</div>
                  } />
                })}
              </mui.List>
            </mui.CardText>
            <mui.CardTitle
              title='Filtering your job-hunt'
              subtitle='Scores train JobSeed to narrow down jobs tailored for your interests.'
              />
            <mui.ListDivider />
            <mui.CardText>
              <mui.List>
                {
                  [
                    {title:'Node.js, Postgres Backend Engineer', sub:'Medical Inc. | San Jose, CA'},
                    {title:'Python Machine Learning Expert', sub:'Singularity Ltd. | Boston, MA', disabled:true},
                    {title:'React + Flux Web/Mobile Developer', sub:'Agency LLC | Portland, OR'},
                    {title:'Backbone, Rails Full-Stack Dev', sub:'NotMyCup Co. | Austin, TX', disabled:true},
                  ].map((i,n)=> <mui.ListItem
                    style={ i.disabled ? {textDecoration:'line-through', opacity:0.5} : {}}
                    leftAvatar={<mui.Avatar src={"http://lorempixel.com/100/100/technics/"+(n+1)} />}
                    primaryText={i.title}
                    secondaryText={i.sub}
                    rightIconButton={rightIconMenu}
                    />
                  )
                }
              </mui.List>
            </mui.CardText>
          </mui.Card>

          <br/>
          <mui.Card>
            <mui.CardTitle
              title={<span>And making <i>you</i> easier to find</span>}
              subtitle={`No more "didn't do their homework" recuiter emails, companies find you because you're a good fit.`} />
            <mui.ListDivider />
            <mui.CardHeader
              title='Me'
              subtitle='Full-stack JavaScript Developer'
              avatar="http://lorempixel.com/100/100/people"
              />
            <mui.CardText>
              <p>
                "Me" matches your company by a score of <span style={{color:'green'}}>+10</span> on the following attributes: <b>React</b>, <b>Node</b>, <b>Postgres</b>.
              </p>
              <mui.RaisedButton label="Contact" />
            </mui.CardText>
          </mui.Card>

        </FullWidthSection>
      </div>
    );
  },
})
