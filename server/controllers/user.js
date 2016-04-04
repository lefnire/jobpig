'use strict';
const db = require('../models');
const _ = require('lodash');
const nconf = require('nconf');
const mail = require('../lib/mail');

const nconfUrl = clientOrServer => nconf.get('urls:' + nconf.get('NODE_ENV') + ':' + clientOrServer);

exports.get = (req, res, next) => {
  db.User.findOne({
    where:{id: req.user.id},
    attributes: {exclude: 'activationKey hash resetPasswordKey salt'},
    include:[
      {model: db.Tag, order:[['key', 'ASC']]},
    ],
  }).then(user => res.json(user))
  .catch(next);
};

exports.override = (req, res, next) => {
  // removed req.params.table, TODO remove from client
  let where = {user_id: req.user.id, tag_id: req.params.id};
  let prom = db.UserTag;
  prom = req.method === 'DELETE'
    ? prom.destroy({where})
    : prom.update(_.pick(req.body, ['locked', 'score']), {where});
  prom.then(() => res.send({})).catch(next);
};

exports.updateProfile = (req, res, next) => {
  let updates = _(req.body)
    .pick('fullname pic linkedin_url github_url twitter_url bio'.split(' '))
    .omitBy(_.isEmpty).value();
  db.User.update(updates, {where:{id: req.user.id}})
    .then(() => exports.get(req, res, next));
};

exports.seedTags = (req, res, next) => {
  let tags = _.filter(req.body.tags, _.isNumber); // previously, tags were coming in as strings
  db.Tag.findAll({where: {id: {$in: tags}}, attributes: ['id']}) // make sure they're there before mapping
  .then(_tags=> sequelize.model('user_tags').bulkCreate(
    _tags.map(t => ({tag_id: t.id, user_id: req.user.id, score: 25}) )
  ))
  .then(() => res.send({}))
  .catch(next);
};

exports.activate = (req, res, next) => {
  let email = req.query.email,
    key = req.query.key;
  db.User.activate(email, key, (err, user) => {
    if (err) return next(err);
    res.send(`
      <h1>Activation successful</h1>
      <p>User ${user.email} has successfully been activated. <a href="${nconfUrl('client')}">Back to site</a></p>
    `);
  })
};

exports.forgotPassword = (req, res, next) => {
  let email = req.body.email;
  db.User.findOne({where: {email, verified: true}}).then(user => {
    if (!user) return next({status:403, message:"User not found or not verified"});
    db.User.setResetPasswordKey(email, (err, user) => {
      if (err) return next(err);

      let link = `${nconfUrl('client')}/#/reset-password?email=${req.body.email}&key=${user.resetPasswordKey}`;
      mail.send({
        to: email,
        subject: "Reset Password",
        text: `Click this link to reset your password: ${link}`,
        html: `Click this link to reset your password: <a href="${link}">${link}</a>`
      }).then(() => res.send({})).catch(err => next(err));
    });
  }).catch(next);
};
exports.resetPassword = (req, res, next) => {
  db.User.resetPassword(req.body.username, req.body.password, req.body.resetPasswordKey, (err, user) => {
    if (err) return next(err);
    res.send({});
  });
};

exports.delete = (req, res, next) => {
  if (req.body.confirm === 'DELETE') {
    return db.User.destroy({where: {id: req.user.id}})
      .then(() => res.send({}))
      .catch(err => next(err));
  }
  return res.send({status: 400, message: "Confirmation required"})
}