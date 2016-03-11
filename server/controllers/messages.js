'use strict';
const db = require('../models/models');
const _ = require('lodash');
const mail = require('../lib/mail');

exports.inbox = (req, res, next) => {
  db.Message.hydrateMessages(req.user.id).then(messages => res.send(messages)).catch(next);
};

exports.sent = (req, res, next) => {

};


//TODO refactor contact & reply
exports.contact = (req, res, next) => {
  if (!req.user.verified) return next(new Error("Email not yet verified."));
  let to,
    subject = req.body.subject,
    body = req.body.body;
  db.User.findById(req.params.uid)
  .then(user => {
    if (!user) throw "User not found"; // catch
    to = user.email;
    return db.Message.create({to: user.id, subject, body, user_id: req.user.id});
  })
  .then(message => {
    res.send(message);
    let text = `<p>New Jobpig message</p><p>${body}</p>`
    return mail.send({to, subject, text});
  }).catch(next);
};

exports.reply = (req, res, next) => {
  if (!req.user.verified) return next(new Error("Email not yet verified."));
  let to, thread;
  db.Message.findOne({where: {id: req.params.mid}})
  .then(message => {
    thread = message;
    return db.User.findById(message.user_id)
  })
  .then(user => {
    if (!user) throw "User not found";
    to = user.email;
    return db.Message.create({
      body: req.body.body,
      user_id: req.user.id,
      message_id: req.params.mid
    });
  }).then(message => {
    res.send(message);
    let text = `<p>New Jobpig message</p><p>${req.body.body}</p>`
    return mail.send({to, subject: thread.subject, text});
  }).catch(next);

};

exports.remove = (req, res, next) =>  {
  // delete then return new (pruned) inbox
  return db.Message.destroy({where:{id: req.params.mid}}).then(() => exports.inbox(req, res, next));
};