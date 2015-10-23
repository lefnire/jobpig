import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {request} from '../../util';

export default class Prospect extends React.Component {
  render() {
    let p = this.props.prospect;
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Send', onTouchTap: this._onDialogSubmit, ref: 'submit' }
    ];
    return <div>
      <mui.Card initiallyExpanded={true}>
        <mui.CardHeader
          title={p.fullname}
          subtitle={'Score: '+p.score+', Tags: '+_.pluck(p.tags,'key').join(', ')}
          avatar={p.pic}
          showExpandableButton={true} />
        <mui.CardText expandable={true}>
          <a href={p.linkedin_url}>LinkedIn</a>
          <div>{p.bio}</div>
        </mui.CardText>
        <mui.CardActions expandable={true}>
          <mui.RaisedButton label="Contact" onTouchTap={this._handleTouchTap.bind(this)} />
        </mui.CardActions>
      </mui.Card>

      <mui.Dialog title="Contact" actions={this.standardActions} ref="contact">
        <mui.ClearFix>
          <mui.TextField hintText="Subject" fullWidth={true}/>
          <mui.TextField hintText="Message" fullWidth={true} multiLine={true} />
        </mui.ClearFix>
      </mui.Dialog>
    </div>
  }
  _handleTouchTap() {
    this.refs.contact.show();
  }
}