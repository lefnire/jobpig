'use strict';
const passportLocalSequelize = require('passport-local-sequelize');
const _ = require('lodash');
const Sequelize = require('sequelize');

let defaultUserSchema = passportLocalSequelize.defaultUserSchema;
delete defaultUserSchema.username;
let User = sequelize.define('users', _.defaults({
  email: {type:Sequelize.STRING, validate:{ isEmail:true }, unique:true, allowNull:false},
  linkedin_id: {type:Sequelize.STRING, unique:true},
  linkedin_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  twitter_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  stackoverflow_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  github_url: {type:Sequelize.STRING, validate:{isUrl:true}},
  fullname: Sequelize.STRING,
  pic: {type:Sequelize.STRING, validate:{isUrl:true}},
  bio: Sequelize.TEXT,
  company: Sequelize.STRING,
  free_jobs: {type: Sequelize.INTEGER, defaultValue: 0} // coupon-applied free job postings
}, defaultUserSchema), {
  classMethods: {
    persistAnon(user_id, anon) {
      if (!anon) return Promise.resolve(); // maybe a server restart?
      return Promise.all([
        sequelize.model('user_tags').bulkCreate(anon.tags.map(t => ({
          user_id,
          tag_id: t.id,
          score: t.score,
        }))),
        sequelize.model('user_jobs').bulkCreate(_.map(anon.jobs, (status,job_id) => ({job_id, user_id, status}))),
      ]);
    }
  }
});
passportLocalSequelize.attachToUser(User, {
  usernameField: 'email',
  usernameLowerCase: true,
  activationRequired: true
});

module.exports = User;