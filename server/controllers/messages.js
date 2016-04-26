'use strict';
const db = require('../models');
const _ = require('lodash');
const mail = require('../lib/mail');

exports.inbox = (req, res, next) => {
  db.Message.hydrateMessages(req.user.id).then(messages => res.send(messages)).catch(next);
};

exports.sent = (req, res, next) => {

};

//TODO refactor contact & reply
exports.contact = (req, res, next) => {
  //if (!req.user.verified) return next({status: 403, message: "Email not yet verified."});
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
    let text = `<p>New Jobpig message</p><p>${body}</p>`
    return mail.send({to, subject, text}).then(() => res.send(message));
  }).catch(next);
};

exports.reply = (req, res, next) => {
  //if (!req.user.verified) return next({status: 403, message: "Email not yet verified."});
  let to, thread;
  db.Message.findOne({where: {id: req.params.mid}})
  .then(message => {
    thread = message;
    return db.User.findById(message.user_id);
  })
  .then(user => {
    if (!user) throw "User not found";
    to = user.email;
    thread.deleted = []; // back to user's inbox if deleted; re-sparking conversation
    return Promise.all([
      db.Message.create({
        body: req.body.body,
        user_id: req.user.id,
        message_id: req.params.mid
      }),
      thread.save()
    ]);
  }).then(vals => {
    let message = vals[0];
    let text = `<p>New Jobpig message</p><p>${req.body.body}</p>`
    return mail.send({to, subject: thread.subject, text}).then(() => res.send(message));
  }).catch(next);

};

exports.remove = (req, res, next) =>  {
  // delete then return new (pruned) inbox
  db.Message.findById(req.params.mid)
  .then(m => {
    // deleted from both parties
    if (_.intersection(m.deleted, [m.to, m.user_id]).length === 2) {
      return m.destroy();
    }
    m.deleted = _.union(m.deleted, [req.user.id]); // add self to deleted, so it won't show up for me anymore
    return m.save();
  }).then(() => exports.inbox(req, res, next));
};