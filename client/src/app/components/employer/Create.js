import React from 'react';
import {
  Dialog,
  FlatButton,
  ClearFix,
} from 'material-ui';
import _ from 'lodash';
import {_fetch, getTags, constants, filterOptions, _ga} from '../../helpers';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import Select from 'react-select';
import StripeCheckout from 'react-stripe-checkout';
import Error from '../Error';
const {TAG_TYPES} = constants;

export default class CreateJob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      canSubmit: false
    };
  }

  render() {
    let {free_jobs} = this.props;

    let title = free_jobs ? `${free_jobs} Free Post${free_jobs>1? 's': ''}`
      : 'Post a Job ($99 for 30 days)';

    return (
      <Dialog
        bodyStyle={{overflow: 'visible'}}
        title={title}
        modal={true}
        open={this.state.open}
        actions={[
          <FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>,
          <FlatButton label="Submit" type="submit" primary={true} disabled={!this.state.canSubmit} onTouchTap={() => this.refs.form.submit()} />
        ]} >

        <ClearFix>

          <StripeCheckout
            ref="stripe"
            token={this.onToken}
            stripeKey="<nconf:stripe:public>"
            amount={9900}>
            <span>{/* StripeCheckout wants to render its own button unless we give it an element; but we don't want to render a button */}</span>
          </StripeCheckout>

          <Error error={this.state.error} />

          <Formsy.Form
            ref="form"
            onValid={() => this.setState({canSubmit: true})}
            onInvalid={() => this.setState({canSubmit: false})}
            onValidSubmit={this.submitForm}
          >
            <fui.FormsyText
              name='title'
              required
              hintText="*Job Title"
              fullWidth={true}
            />
            <fui.FormsyText
              name='company'
              required
              hintText="*Company"
              fullWidth={true}
            />
            <fui.FormsyText
              name='url'
              hintText="Job URL (optional)"
              fullWidth={true}
              validations="isUrl"
              validationError="Enter a valid URL"

            />
            <Select.Async
              placeholder="Tags"
              multi={true}
              value={this.state.tags}
              loadOptions={() => getTags().then(options => ({options})) }
              onChange={this.changeTags}
              noResultsText="Start typing"
              filterOptions={filterOptions(true)}
            />
            <Select.Async
              placeholder="Location"
              value={this.state.location}
              loadOptions={() => getTags(TAG_TYPES.LOCATION).then(options => ({options})) }
              onChange={this.changeLocation}
              noResultsText="Start typing"
              filterOptions={filterOptions(true)}
            />
            <fui.FormsyCheckbox
              name='remote'
              label="Remote"
            />
            <fui.FormsyText
              name='description'
              required
              hintText="*Job Description"
              multiLine={true}
              rows={3}
              fullWidth={true}
            />

          </Formsy.Form>
        </ClearFix>
      </Dialog>
    )
  }

  // FIXME Temporary until react-select fixes allowCreate={true}
  changeLocation = location => {
    if (location.create)
      location.label = location.label.replace(/^Add /, '');
    this.setState({location});
  };
  changeTags = tags => {
    let entered = _.last(tags);
    if (entered && entered.create)
      entered.label = entered.label.replace(/^Add /, '');
    this.setState({tags});
  }
  // /FIXME -----------------

  open = () => {
    _ga.pageview('modal:create-job');
    this.setState({open: true});
  };
  close = () => {
    _ga.pageview();
    this.setState({open: false});
  };

  submitForm = body => {
    let {location, tags} = this.state;
    body.location = location && location.label;
    body.tags = tags && _.map(tags, 'label');
    _fetch('jobs', {method:"POST", body})
    .then(created => {
      // they had free jobs (coupons)
      if (created.pending === false)
        return this._posted();
      this.job_id = created.id;
      this.refs.stripe.onClick()
    })
    .catch(error => this.setState({error}));
  };

  onToken = token => {
    // POST server/payments {token: token}
    _fetch('payments', {method: "POST", body:{token, job_id: this.job_id}})
    .then(() => this._posted()).catch(error => this.setState({error}));
  };

  _posted() {
    _ga.event('revenue','purchase');
    global.jobpig.alerts.alert('Payment success, posting job now.');
    this.close();
    this.props.onCreate();
    this.job_id = null;
  }
}
