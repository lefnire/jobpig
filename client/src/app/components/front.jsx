import React from 'react';
import mui from 'material-ui';
import request from 'superagent';

import FullWidthSection from './material-ui-docs/full-width-section.jsx';
let { Mixins, RaisedButton, Styles } = require('material-ui');
let { StylePropable, StyleResizable } = Mixins;
let { Colors, Spacing, Typography } = Styles;
let ThemeManager = new Styles.ThemeManager().getCurrentTheme();

export default React.createClass({
  mixins: [StylePropable, StyleResizable],

  render(){
    return this._getHomePageHero()
  },

  _getHomePageHero() {
    let styles = {
      root: {
        background: Colors.cyan500,
        overflow: 'hidden'
      },
      tagline: {
        margin: '16px auto 0 auto',
        textAlign: 'center',
        maxWidth: '575px'
      },
      label: {
        color: ThemeManager.palette.primary1Color,
      },
      h1: {
        color: Colors.darkWhite,
        fontWeight: Typography.fontWeightLight,
      },
      h2: {
        //.mui-font-style-title
        fontSize: '20px',
        lineHeight: '28px',
        paddingTop: '19px',
        marginBottom: '13px',
        letterSpacing: '0',
      },
      nowrap: {
        whiteSpace: 'nowrap'
      },
      taglineWhenLarge: {
        marginTop: '32px'
      },
      h1WhenLarge: {
        fontSize: '56px'
      },
      h2WhenLarge: {
        //.mui-font-style-headline;
        fontSize: '24px',
        lineHeight: '32px',
        paddingTop: '16px',
        marginBottom: '12px'
      }
    };

    styles.h2 = this.mergeStyles(styles.h1, styles.h2);

    if (this.isDeviceSize(StyleResizable.statics.Sizes.LARGE)) {
      styles.tagline = this.mergeStyles(styles.tagline, styles.taglineWhenLarge);
      styles.h1 = this.mergeStyles(styles.h1, styles.h1WhenLarge);
      styles.h2 = this.mergeStyles(styles.h2, styles.h2WhenLarge);
    }

    return (
      <div>
        <mui.Dialog
          actions={[{text:'Close'}]}
          actionFocus="submit"
          ref="dialog" >
          <mui.Tabs>
            <mui.Tab label="Login" >
              <form action='/login' method='POST'>
                <mui.TextField required={true} name='email' type='email' hintText='Email Address' fullWidth={true} />
                <mui.TextField required={true} name='password' type='password' hintText='Password' fullWidth={true} />
                <mui.RaisedButton primary={true} label='Submit' type='submit'/>
              </form>
            </mui.Tab>
            <mui.Tab label="Register" >
              <form action='/register' method='POST'>
                <mui.TextField required={true} name='email' type='email' hintText='Email Address' fullWidth={true} />
                <mui.TextField required={true}name='password' type='password' hintText='Password' fullWidth={true} />
                <mui.TextField required={true} name='confirmPassword' type='password' hintText='Confirm Password' fullWidth={true} />
                <mui.RaisedButton primary={true} label='Submit' type='submit'/>
              </form>
            </mui.Tab>
          </mui.Tabs>
        </mui.Dialog>

        <mui.AppBar
          iconElementRight={
            <mui.RaisedButton label='Login / Register' onTouchTap={()=>this.refs.dialog.show()} />
          }
          iconElementLeft={false}
          />
        <FullWidthSection style={styles.root}>
          <div style={styles.tagline}>
            <h1 style={styles.h1}>JobSeed</h1>
            <h2 style={styles.h2}>
              Pandora-like job board, find jobs tailored to you
            </h2>
          </div>
          <div style={{paddingLeft:50, paddingRight:50}}>
            {/*Content*/}
          </div>
        </FullWidthSection>
      </div>
    );
  },
})
