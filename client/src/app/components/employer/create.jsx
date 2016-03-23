import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch, getTags, constants} from '../../helpers';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import Select from 'react-select';
import StripeCheckout from 'react-stripe-checkout';
import Error from '../error';
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
    //Handle on server: key, source
    return (
      <mui.Dialog
        bodyStyle={{overflow: 'visible'}}
        title="Create Job | $100 for 30 days"
        modal={true}
        open={this.state.open}
        actions={[
          <mui.FlatButton label="Cancel" secondary={true} onTouchTap={this.close}/>,
          <mui.FlatButton label="Submit" type="submit" primary={true} disabled={!this.state.canSubmit} onTouchTap={() => this.refs.form.submit()} />
        ]} >

        <mui.ClearFix>

          <StripeCheckout
            ref="stripe"
            token={this.onToken}
            stripeKey="<nconf:stripe:public>"
            amount={10000}>
            <span>{/* StripeCheckout wants to render its own button unless we give it an element; but we don't want to render a button */}</span>
          </StripeCheckout>

          <Error error={this.state.error} />

          <Formsy.Form
            ref="form"
            onValid={() => this.setState({canSubmit: true})}
            onInvalid={() => this.setState({canSubmit: false})}
            onValidSubmit={this.submitForm}>
            <fui.FormsyText name='title' required hintText="*Title" fullWidth={true}/>
            <fui.FormsyText name='company' required hintText="*Company" fullWidth={true}/>
            <Select.Async
              placeholder="Location"
              value={this.state.location}
              loadOptions={() => getTags(TAG_TYPES.LOCATION).then(options => ({options})) }
              onChange={this.changeLocation}
              filterOptions={this.filterOptions}
            />
            <fui.FormsyCheckbox name='remote' label="Remote"/>
            <fui.FormsyText name='description' required hintText="*Description" multiLine={true} rows={3} fullWidth={true}/>

            {/*<fui.FormsyText name='tags' required hintText="*Skills/Tags (comma-delimited)" fullWidth={true}/>*/}
            <Select.Async
              placeholder="Tags"
              multi={true}
              value={this.state.tags}
              loadOptions={() => getTags().then(options => ({options})) }
              onChange={this.changeTags}
              filterOptions={this.filterOptions}
            />


          </Formsy.Form>
        </mui.ClearFix>
      </mui.Dialog>
    )
  }

  // FIXME Temporary until react-select fixes allowCreate={true}
  filterOptions = (options, filter, currentValues) =>
    !filter ? options : _(options)
      .filter(o => RegExp(filter, 'ig').test(o.label))
      .difference(currentValues)
      .concat(_.some(currentValues, {label: filter}) ? [] : [{label: `Add ${filter}`, value: filter, create:true}])
      .value();

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

  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  submitForm = body => {
    body.location = this.state.location.label;
    body.tags = _.map(this.state.tags, 'label').join(',');
    _fetch('jobs', {method:"POST", body})
    .then(created => {
      this.job_id = created.id;
      this.refs.stripe.onClick()
    })
    .catch(error => this.setState({error}));
  };

  onToken = token => {
    // POST server/payments {token: token}
    _fetch('payments', {method: "POST", body:{token, job_id: this.job_id}})
    .then(()  => {
      global.jobpig.alerts.alert('Payment success, posting job now.');
      this.close();
      this.props.onCreate();
      this.job_id = null;
    })
    .catch(error => this.setState({error}));
  };
}
