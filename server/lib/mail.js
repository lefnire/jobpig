'use strict';
const nodemailer = require('nodemailer');
const nconf = require('nconf');
const transporter = nodemailer.createTransport(nconf.get("mail")); //config.json#mail needs a full config object
const _ = require('lodash');

exports.send = (data, cb) => {
  if (!(data.to && data.subject && data.text))
    return cb(new Error('Email error: Recipient, subject, and body required'));

  let email = _.pick(data, ['to', 'subject', 'text', 'html']);
  _.defaults(email, {
    from: 'Jobpig <admin@jobpigapp.com>',
    html: email.text
  });

  transporter.sendMail(email, (err, info) =>
    err ? console.log(error) : console.log('Message sent: ' + info.response)
  );
};