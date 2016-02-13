'use strict';
const db = require('../models/models');
const _ = require('lodash');

exports.inbox = (req, res, next) => {
  db.Message.findAll({
    where: { to: req.user.id },
    include: [{ all: true, nested: true }]
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
  }).then(created => res.send(created)).catch(next);
};

exports.reply = (req, res, next) => {

};

exports.remove = (req, res, next) =>  {

};