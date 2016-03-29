'use strict';
const Sequelize = require('sequelize');
const constants = require('../lib/constants');
const FILTERS = constants.FILTERS;

let UserJob = sequelize.define('user_jobs', {
  status: {type:Sequelize.INTEGER, defaultValue: FILTERS.MATCH, allowNull:false},
  note: Sequelize.TEXT
});

module.exports = UserJob;