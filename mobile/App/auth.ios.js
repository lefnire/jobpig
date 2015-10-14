'use strict';

let React = require('react-native');

let {
  Text,
  View,
  ListView,
  AsyncStorage,
  StyleSheet,
  TouchableHighlight
} = React;

let t = require('tcomb-form-native');
let {Form} = t.form;

let STORAGE_KEY = '@Jobpig:jwt';
let AuthModel = t.struct({
  email: t.Str,
  password: t.Str,
});
let options = {
  fields: {
    email: {keyboardType: 'email-address'},
    password: {secureTextEntry: true},
  }
}

let token = null;
module.exports.logout = ()=> AsyncStorage.removeItem(STORAGE_KEY);
module.exports.getToken = ()=> token;

module.exports.Auth = React.createClass({
  componentDidMount() {
    this._loadUser().done();
  },
  async _loadUser() {
    try {
      token = await AsyncStorage.getItem(STORAGE_KEY);
      if (!token) return;
      this.props.login();
    } catch (error) {
      alert('AsyncStorage error: ' + error.message);
    }
  },
  render: function() {
    console.log('auth render');
    return(
      <View style={styles.container}>
        {/* display */}
        <Form
          ref="form"
          type={AuthModel}
          options={options}
          />
        <TouchableHighlight style={styles.button} onPress={this.onPress} underlayColor='#99d9f4'>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableHighlight>
      </View>
    );
  },
  onPress: async function() {
    try {
      let res = await fetch('http://jobpigapp.herokuapp.com/login', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.refs.form.getValue())
      });
      token = (await res.json()).token;
      await AsyncStorage.setItem(STORAGE_KEY, token);
      this._loadUser().done();
    } catch (err) {
      console.log(err);
    }
  },
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