import React from 'react';
import {
  Card,
  CardHeader,
  CardText,
  CardActions,
  RaisedButton,
} from 'material-ui';
import _ from 'lodash';
import {_ga} from '../../helpers';
import Contact from './Contact';

export default class Prospect extends React.Component {
  render() {
    let p = this.props.prospect;
    return <div>
      <Card initiallyExpanded={true}>
        <CardHeader
          title={p.fullname || 'Anonymous'}
          subtitle={`Score: ${p.score}, Tags: ${_.map(p.tags,'key').join(', ')}`}
          avatar={p.pic}
          showExpandableButton={true} />
        <CardText expandable={true}>
          {_.map({linkedin_url: "LinkedIn", twitter_url: "Twitter", github_url: "Github"}, (v, k) =>
            p[k] ? <a href={p[k]} target="_blank" key={k}>{v}</a> : null
          )}
          <div>{p.bio}</div>
        </CardText>}
        <CardActions expandable={true}>
          <RaisedButton label="Contact" onTouchTap={this._handleTouchTap} />
        </CardActions>
      </Card>

      <Contact ref="contact" prospect={p} />
    </div>
  }

  _handleTouchTap = () => this.refs.contact.open();
}