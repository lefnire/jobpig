'use strict';
const utils = require('../lib/utils');
const constants = require('../lib/constants');
const TAG_TYPES = constants.TAG_TYPES;
const Sequelize = require('sequelize');
const _ = require('lodash');
const UserTag = require('./user_tag');

let Tag = sequelize.define('tags', {
  key: {type: Sequelize.STRING, allowNull: false},
  text: Sequelize.STRING,
  type: {type: Sequelize.INTEGER /*ENUM(_.values(TAG_TYPES))*/, defaultValue: TAG_TYPES.SKILL, allowNull: false},

  // When users suggest tags, they're created as pending. If another user suggests the same, it's enabled
  pending: {type: Sequelize.BOOLEAN, defaultValue: false}
}, {
  classMethods: {
    bulkScore(user_id, tags) {
      // Ensure not already created; then bulk-create scores
      return UserTag.findAll({where: {user_id, tag_id: {$in: _.map(tags, 'id')}}, attributes: ['tag_id']})
        .then(user_tags => UserTag.bulkCreate(
          _.filter(tags, t => !_.find(user_tags, {tag_id: t.id}))
            .map(t => ({tag_id: t.id, user_id, score: 25}))
        ));
    },

    seedTags(user_id, tags) {
      // Ensure required fields present
      tags = _.filter(tags, t => t.id || (t.text && t.type));

      // Create / corroborate suggestions
      let suggestions = _.remove(tags, 'create').map(t => _.assign(t, {
        key: utils.textToKey(t.text),
        pending: true
      }));
      let vetted = [];

      return Promise.all([
        // ------ Seed existent tags ------
        // (extra findAll here to ensure legit ids)
        Tag.findAll({where: {id: {$in: _.map(tags, 'id')}}, attributes: ['id']})
          .then(found => Tag.bulkScore(user_id, found)),

        // ------  Handle suggestions ------
        // Corroborate already-suggested tags
        // FIXME this allows the same user to vet their own tags. Do a join on user_tags to filter out this users' suggestions
        Tag.update({pending: false}, {
          where: {$or: suggestions.map(s => _.pick(s, ['key', 'type']))},
          returning: true
        })
        // Create those which don't exist
        .spread((ct, updated) => {
          vetted = updated;
          return Tag.bulkCreate(_.differenceBy(suggestions, vetted, 'key'), {returning: true});
        })
        // And score
        .then(created => Tag.bulkScore(user_id, created.concat(vetted)))

      ]);
    }
  },
  indexes: [
    {unique: true, fields: ['key', 'type']},
    {unique: false, fields: ['key']},
    //{unique: false, fields: ['type']},
    {unique: false, fields: ['type', 'pending']},
    {unique: false, fields: ['pending']},
  ]
});

module.exports = Tag;