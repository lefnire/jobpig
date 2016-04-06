'use strict';
const constants = require('../lib/constants');
const TAG_TYPES = constants.TAG_TYPES;
const Sequelize = require('sequelize');

let Tag = sequelize.define('tags', {
  key: {type: Sequelize.STRING, allowNull: false},
  text: Sequelize.STRING,
  type: {type: Sequelize.INTEGER /*ENUM(_.values(TAG_TYPES))*/, defaultValue: TAG_TYPES.SKILL, allowNull: false}
}, {
  indexes: [
    {unique: true, fields: ['key', 'type']},
    {unique: false, fields: ['type']},
    {unique: false, fields: ['key']}
  ]
});

module.exports = Tag;