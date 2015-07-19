import React from 'react';
import mui from 'material-ui';
import _ from 'lodash';

let prospects = [
  {
    name:'Jon Doe',
    title:'Professional LAMP dev',
    img: "http://lorempixel.com/100/100/abstract",
    industries: ['Nonprofit', 'Technology'],
    skills:['php','javascript','mysql']
  },
  {
    name:'Mary Jane',
    title: 'CMS expert',
    industries: ['Nonprofit', 'Technology'],
    img: "http://lorempixel.com/100/100/people",
    skills:['drupal','wordpress']
  },
  {
    name:'Frank Francis',
    title: 'Hipster new-tech',
    industries: ['Nonprofit', 'Technology'],
    img: "http://lorempixel.com/100/100/animals",
    skills:['go','artificial intelligence', 'closure']
  }
];
export default class Prospects extends React.Component {
  render() {
    let standardActions = [
      { text: 'Cancel' },
      { text: 'Send', onTouchTap: this._onDialogSubmit, ref: 'submit' }
    ];
    return (
      <div>

        <mui.Dialog title="Contact" actions={this.standardActions} ref="contact">
          <mui.ClearFix>
            <mui.TextField hintText="Subject" /><br/>
            <mui.TextField hintText="Message" multiLine={true} />
          </mui.ClearFix>
        </mui.Dialog>

        {prospects.map((p)=> {
          return <mui.Card>
            <mui.CardHeader title={p.name} subtitle={p.title} avatar={p.img} />
            <mui.CardActions>
              <mui.RaisedButton label="Contact" onTouchTap={this._handleTouchTap.bind(this)} />
              <mui.RaisedButton label="Hide"/>
            </mui.CardActions>
            <mui.CardText>
              <p><b>Skills: {p.skills.join(', ')}</b></p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
              Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
              Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
            </mui.CardText>
          </mui.Card>
        })}
      </div>
    )
  }
  _handleTouchTap() {
    this.refs.contact.show();
  }
}