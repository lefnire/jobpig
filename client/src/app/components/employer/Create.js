import React from 'react';
import load from 'load-script';
import {
  FlatButton,
} from 'material-ui';
import _ from 'lodash';
import {_fetch, getTags, constants, filterOptions, _ga, isSmall} from '../../helpers';
import Formsy from 'formsy-react';
import {
  FormsyText,
  FormsyCheckbox
} from 'formsy-material-ui';
import Select from 'react-select';
import StripeCheckout from 'react-stripe-checkout';
import Error from '../Error';
const {TAG_TYPES} = constants;
import {
  Modal
} from 'react-bootstrap';

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

    return (
      <Modal show={this.state.open} onHide={this.close} bsSize="large" dialogClassName="full-modal"  animation={!isSmall}>
        <Modal.Header>
          <Modal.Title>
            <span style={{textDecoration: 'line-through'}}>($99 for 30 days)</span>&nbsp;
            {
              free_jobs? <b>{free_jobs} Free Post{free_jobs>1? 's': ''}!</b>
                : <span><b>Free post per share</b> <small>(click a button below)</small></span>
            }
          </Modal.Title>
          <div className="addthis_sharing_toolbox"></div>
        </Modal.Header>
        <Modal.Body>
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
            <FormsyText
              name='title'
              required
              hintText="*Job Title"
              fullWidth={true}
            />
            <FormsyText
              name='company'
              required
              hintText="*Company"
              fullWidth={true}
            />
            <FormsyText
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
            <br/>
            <FormsyCheckbox
              name='remote'
              label="Remote"
            />
            <Select.Async
              placeholder="Location"
              value={this.state.location}
              loadOptions={() => getTags(TAG_TYPES.LOCATION).then(options => ({options})) }
              onChange={this.changeLocation}
              noResultsText="Start typing"
              filterOptions={filterOptions(true)}
            />
            <FormsyText
              name='description'
              required
              hintText="*Job Description"
              multiLine={true}
              rows={3}
              fullWidth={true}
            />

          </Formsy.Form>
        </Modal.Body>
        <Modal.Footer>
          <FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>
          <FlatButton label="Submit" primary={true} disabled={!this.state.canSubmit} onTouchTap={() => this.refs.form.submit()} />
        </Modal.Footer>
      </Modal>
    )
  }

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

  open = () => {
    load('https://s7.addthis.com/js/300/addthis_widget.js#pubid=lefnire', _.noop);
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
