'use strict';
const passportLocalSequelize = require('passport-local-sequelize');
const _ = require('lodash');
const Sequelize = require('sequelize');

let defaultUserSchema = passportLocalSequelize.defaultUserSchema;
delete defaultUserSchema.username;
let User = sequelize.define('users', _.defaults({
  email: {type:Sequelize.STRING, validate:{ isEmail:true }, unique:true, allowNull:false},
  linkedin_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  twitter_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  stackoverflow_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  github_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  fullname: Sequelize.STRING,
  pic: {type:Sequelize.STRING, validate:{isUrl:true}},
  bio: Sequelize.TEXT,
  company: Sequelize.STRING
}, defaultUserSchema));
passportLocalSequelize.attachToUser(User, {
  usernameField: 'email',
  usernameLowerCase: true,
  activationRequired: true
});

module.exports = User;