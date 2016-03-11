'use strict';
const nodemailer = require('nodemailer');
const nconf = require('nconf');
const transporter = nodemailer.createTransport(nconf.get("mail")); //config.json#mail needs a full config object

exports.send = (data, cb) => {
  if (!(data.recipient && data.subject && data.body))
    return cb(new Error('Email error: Recipient, subject, and body required'));

  const mailOptions = {
    from: 'Jobpig <admin@jobpigapp.com>',
    to: data.recipient, // or comma-separated recipients
    subject: data.subject,
    text: data.body,
    html: data.body
  };

  transporter.sendMail(mailOptions, (err, info) =>
    err ? console.log(error) : console.log('Message sent: ' + info.response)
  );
};