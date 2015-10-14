'use strict';

let React = require('react-native');
let {
  Text,
  View,
  ListView,
  AsyncStorage,
  StyleSheet,
  TouchableHighlight,
} = React;

let _ = require('lodash');
let auth = require('./auth.ios');

let Job = React.createClass({
  getInitialState(){
    return {job: false};
  },

  async componentDidMount(){
    try {
      let res = await fetch('http://jobpigapp.herokuapp.com/jobs/inbox', {
        headers: {'x-access-token': auth.getToken()}
      });
      res = await res.json();
      if(res.message)
        this.props.logout();
      this.setState({job:res[0]});
    } catch (err) {
      console.log(err);
    }
  },

  render() {
    if (!this.state.job)
      return <View style={styles.container}>
        <Text>Loading...</Text>
      </View>;

    let job = this.state.job;
    return <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.meta}>{this._meta(job)}</Text>
      <View>{
        [{k:'applied',v:'Applied'}, {k:'hidden',v:'Skip'}].map(button=>
          <TouchableHighlight style={[styles.button, styles.metaBtn]} onPress={()=>this._setStatus(button.k)} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>{button.v}</Text>
          </TouchableHighlight>
        )
      }</View>
      <View>{
        [{k: 'liked', v: 'Like'}, {k: 'disliked', v: 'Dislike'}].map(button=>
          <TouchableHighlight style={[styles.button, styles.thumb]} onPress={()=>this._setStatus(button.k)} underlayColor='#99d9f4'>
            <Text style={styles.buttonText}>{button.v}</Text>
          </TouchableHighlight>
        )
      }</View>
      <Text>{this._htmlToString(job.description)}</Text>
    </View>;
  },

  _meta(job){
    let score = job.score>0 ? `+${job.score}` : job.score<0 ? job.score : false;
    let meta = _.filter([
      {name:"Source", text:job.source, icon:'find_in_page'},
      {name:"Company", text:job.company, icon:'supervisor_account'},
      {name:"Location", text:job.location, icon:'room'},
      {name:"Budget", text:job.budget, icon:'attach_money'},
      {name:"Score", text:score, icon:'thumb_up'},
      {name:"Tags", icon:'label', style:{color:'rgb(0, 188, 212)', textTransform:'uppercase', fontWeight:500}, text: _.pluck(job.tags, 'key').join(', ') }
    ], 'text');
    return <Text>{meta.map(m=> `${m.name}: ${m.text}`).join('; ')}</Text>;
  },

  _htmlToString(str) {
    return String(str).replace(/<p>/g, '\n\n').replace(/&#x2F;/g, '/').replace('<i>', '').replace('</i>', '').replace(/&#x27;/g, '\'').replace(/&quot;/g, '\"').replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)" rel="nofollow">(.*)?<\/a>/g, "$1");
  },

  _setStatus(status){
    //JobActions.setStatus({id:this.props.job.id,status});
  }

});

let styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
  btnText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  }
});

module.exports = Job;