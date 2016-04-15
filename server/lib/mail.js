'use strict';
const nodemailer = require('nodemailer');
const nconf = require('nconf');
const transporter = nodemailer.createTransport(nconf.get("mail")); //config.json#mail needs a full config object
const _ = require('lodash');

exports.send = data => new Promise((resolve, reject) => {
  if (!(data.to && data.subject && data.text)) {
    let err = new Error('Email error: Recipient, subject, and body required')
    console.error(err)
    return reject(err);
  }

  let email = _.pick(data, ['to', 'subject', 'text', 'html']);
  _.defaults(email, {
    from: 'Jobpig <admin@jobpigapp.com>',
    html: email.text
  });

  if (nconf.get('NODE_ENV') !== 'production' && !exports.testEmail)
    return resolve();
  transporter.sendMail(email, (err, info) => {
    if (err) {
      console.error(err);
      return reject(err);
    };
    console.log('Message sent: ' + info.response);
    resolve(info);
  });
});

exports.testEmail = false;