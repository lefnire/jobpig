import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import request from 'superagent';

export default class Prospect extends React.Component {
  render() {
    var p = this.props.prospect;
    var standardActions = [
      { text: 'Cancel' },
      { text: 'Send', onTouchTap: this._onDialogSubmit, ref: 'submit' }
    ];
    return <div>
      <mui.Card initiallyExpanded={true}>
        <mui.CardHeader
          title={'User-'+p.id}
          subtitle={'Score: '+p.score+', Tags: '+_.pluck(p.tags,'key').join(', ')}
          avatar='http://lorempixel.com/100/100/people'
          showExpandableButton={true}>
        </mui.CardHeader>
        <mui.CardText expandable={true}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
          Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
          Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
        </mui.CardText>
        <mui.CardActions expandable={true}>
          <mui.RaisedButton label="Contact" onTouchTap={this._handleTouchTap.bind(this)} />
          {/*<mui.RaisedButton label="Hide"/>*/}
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