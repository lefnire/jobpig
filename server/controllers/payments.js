'use strict';
const nconf = require('nconf');
const db = require('../models/models');
const _ = require('lodash');
const stripe = require('stripe')(nconf.get('stripe:private'));

exports.validate = (req, res, next) => {
  // Create a new customer and then a new charge for that customer:
  let token = req.body.token;
  return stripe.customers.create({
    email: token.email,
    source: token.id
  }).then(customer => {
    return stripe.charges.create({
      amount: 10000,
      currency: 'usd',
      customer: customer.id
    })
  }).then(charge => db.Payment.create({txn_id: charge.id}))
  .then(() => res.send({}))
  .catch(next);
};