'use strict';
const db = require('../models/models');
const _ = require('lodash');

exports.inbox = (req, res, next) => {
  db.Message.findAll({
    where: {to: req.user.id},
    include: [
      db.User,
      {model: db.Message, include: [db.Message]}
    ]
  }).then(messages => res.send(messages)).catch(next);
};

exports.sent = (req, res, next) => {

};

exports.contact = (req, res, next) => {
  db.Message.create({
    to: req.params.uid,
    subject: req.body.subject,
    body: req.body.body,
    user_id: req.user.id
  }).then(message => res.send(message)).catch(next);
};

exports.reply = (req, res, next) => {
  return db.Message.create({
    body: req.body.body,
    user_id: req.user.id,
    message_id: req.params.mid
  }).then(message => res.send(message)).catch(next);
};

exports.remove = (req, res, next) =>  {
  db.Message.destroy({where:{id: req.params.mid}}).then(()=> res.send({})).catch(next);
};