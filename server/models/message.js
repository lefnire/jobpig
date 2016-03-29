'use strict';
const Sequelize = require('sequelize');
const User = require('./user');

let Message = sequelize.define('messages', {
  to: {
    type: Sequelize.INTEGER,
    references: {model: User, key: 'id'}
  },
  subject: Sequelize.STRING,
  body: {type: Sequelize.TEXT, allowNull: false},
  // When users delete, remove for just the deleter (not the sender); handle that by tracking who deleted
  deleted: {type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: []}
}, {
  classMethods: {
    hydrateMessages(to) {
      // see http://dba.stackexchange.com/questions/129263/multiple-to-jsonarray-agg-separate-joins
      return sequelize.query(`
        SELECT m.*, u.users, r.replies
        FROM messages m
        LEFT JOIN LATERAL (
          SELECT json_agg(u) AS users
          FROM (
            SELECT id, fullname, email, company, pic
            FROM users
            WHERE id IN (m.user_id, m.to)
          ) u
        ) u ON TRUE
        LEFT JOIN LATERAL (
          SELECT json_agg(r) AS replies
          FROM (
            SELECT *
            FROM messages
            WHERE message_id = m.id
            ORDER BY created_at
          ) r
        ) r ON TRUE
        WHERE :to IN (m.user_id, m.to) AND m.to IS NOT NULL AND NOT (:to = ANY (m.deleted))
        `, { replacements: {to}, type: sequelize.QueryTypes.SELECT});
    }
  }
});

module.exports = Message;