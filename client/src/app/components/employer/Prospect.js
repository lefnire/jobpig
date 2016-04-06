import React from 'react';
import MUI from 'material-ui';
import _ from 'lodash';
import Contact from './Contact';

export default class Prospect extends React.Component {
  render() {
    let p = this.props.prospect;
    return <div>
      <MUI.Card initiallyExpanded={true}>
        <MUI.CardHeader
          title={p.fullname || 'Anonymous'}
          subtitle={`Score: ${p.score}, Tags: ${_.map(p.tags,'key').join(', ')}`}
          avatar={p.pic}
          showExpandableButton={true} />
        <MUI.CardText expandable={true}>
          {_.map({linkedin_url: "LinkedIn", twitter_url: "Twitter", github_url: "Github"}, (v, k) =>
            p[k] ? <a href={p[k]} target="_blank" key={k}>{v}</a> : null
          )}
          <div>{p.bio}</div>
        </MUI.CardText>}
        <MUI.CardActions expandable={true}>
          <MUI.RaisedButton label="Contact" onTouchTap={this._handleTouchTap} />
        </MUI.CardActions>
      </MUI.Card>

      <Contact ref="contact" prospect={p} />
    </div>
  }

  _handleTouchTap = () => this.refs.contact.handleOpen();
}