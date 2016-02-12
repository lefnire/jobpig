import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';
import {_fetch, getTags} from '../../helpers';
import Formsy from 'formsy-react'
import fui from 'formsy-material-ui';
import Select from 'react-select';
import StripeCheckout from 'react-stripe-checkout';

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
        title="Create Job"
        modal={true}
        open={this.state.open}
        actions={[
          <mui.FlatButton label="Cancel" secondary={true} onTouchTap={this.handleClose}/>,
          <mui.FlatButton label="Submit" type="submit" primary={true} disabled={!this.state.canSubmit} onTouchTap={() => this.refs.form.submit()}/>
        ]} >
        <StripeCheckout
          token={this.onToken}
          stripeKey="<nconf:stripe:public>"
          amount={10000}/>

        <mui.ClearFix>
          <Formsy.Form
            ref="form"
            onValid={() => this.setState({canSubmit: true})}
            onInvalid={() => this.setState({canSubmit: false})}
            onValidSubmit={this.submitForm}>
            <fui.FormsyText name='title' required hintText="*Title" fullWidth={true}/>
            <fui.FormsyText name='company' required hintText="*Company" fullWidth={true}/>
            <fui.FormsyText name='location' hintText="Location" fullWidth={true}/>
            <fui.FormsyCheckbox name='remote' label="Remote"/>

            {/*<fui.FormsyText name='tags' required hintText="*Skills/Tags (comma-delimited)" fullWidth={true}/>*/}
            <Select.Async
              multi={true}
              value={this.state.selected}
              loadOptions={() => getTags().then(options => {return {options}}) }
              onChange={selected => this.setState({selected})}
            />

            <fui.FormsyText name='money' validations='isAlpha' validationError="Please enter numbers" hintText="Money (budget, salary, hourly-rate, etc)" fullWidth={true}/>
            <fui.FormsyText name='description' required hintText="*Description" multiline={true} rows={2} fullWidth={true}/>
          </Formsy.Form>
        </mui.ClearFix>
      </mui.Dialog>
    )
  }


  handleOpen = () => this.setState({open: true});
  handleClose = () => this.setState({open: false});

  submitForm = (body) => {
    body.tags = _.map(this.state.selected, 'label').join(',');
    debugger;
    this.handleClose();
    _fetch('jobs', {method:"POST", body}).then(this.props.onCreate);
  };

  onToken = (token) => {
    xhrStripeTokenToMyServer(token).then( () => {
      // please do with HTTPS
    });
  };
}
