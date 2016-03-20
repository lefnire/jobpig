'use strict';
const nconf = require('nconf');
const db = require('../models/models');
const _ = require('lodash');
const stripe = require('stripe')(nconf.get('stripe:private'));

exports.validate = (req, res, next) => {
  let job = req.body.job;
  let token = req.body.token;
  let user_id = req.user.id;

  // Create a new customer and then a new charge for that customer:
  return stripe.customers.create({
    email: token.email,
    source: token.id
  }).then(customer => {
    return stripe.charges.create({
      amount: 10000,
      currency: 'usd',
      customer: customer.id
    })
  }).then(charge => {
    return Promise.all([
        db.Payment.create({txn_id: charge.id}),
        db.Job.addCustom(user_id, job)
    ])
  }).then(() => res.send({})).catch(next);
};