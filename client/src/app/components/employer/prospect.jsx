import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleOpen = () => this.setState({open: true});

  handleClose = () => this.setState({open: false});

  render() {
    const actions = [
      <mui.FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.handleClose}
      />,
      <mui.FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleClose}
      />,
    ];

    return (
      <mui.Dialog
        title="Contact"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        <mui.ClearFix>
          <mui.TextField hintText="Subject" fullWidth={true}/>
          <mui.TextField hintText="Message" fullWidth={true} multiLine={true} />
        </mui.ClearFix>
      </mui.Dialog>
    );
  }
}

export default class Prospect extends React.Component {
  render() {
    let p = this.props.prospect;
    return <div>
      <mui.Card initiallyExpanded={true}>
        <mui.CardHeader
          title={p.fullname || 'Anonymous'}
          subtitle={`Score: ${p.score}, Tags: ${_.pluck(p.tags,'key').join(', ')}`}
          avatar={p.pic}
          showExpandableButton={true} />
        <mui.CardText expandable={true}>
          {_.map({linkedin_url: "LinkedIn", twitter_url: "Twitter", github_url: "Github"}, (v, k) =>
            p[k] ? <a href={p[k]} target="_blank" key={k}>{v}</a> : null
          )}
          <div>{p.bio}</div>
        </mui.CardText>}
        <mui.CardActions expandable={true}>
          <mui.RaisedButton label="Contact" onTouchTap={this._handleTouchTap} />
        </mui.CardActions>
      </mui.Card>

      <Contact ref="contact" />
    </div>
  }

  _handleTouchTap = () => this.refs.contact.handleOpen();
}