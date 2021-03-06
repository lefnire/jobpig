'use strict';
const nconf = require('nconf');
const db = require('../models');
const _ = require('lodash');
const stripe = require('stripe')(nconf.get(`stripe:${nconf.get('NODE_ENV')}:private`));
const PRICE = require('../lib/constants').PRICE;

exports.validate = (req, res, next) => {
  let job_id = req.body.job_id;
  let token = req.body.token;
  let user_id = req.user.id;

  // Create a new customer and then a new charge for that customer:
  return stripe.customers.create({
    email: token.email,
    source: token.id
  }).then(customer => {
    return stripe.charges.create({
      amount: PRICE * 100,
      currency: 'usd',
      customer: customer.id
    })
  }).then(charge => {
    return Promise.all([
        db.Payment.create({txn_id: charge.id}),
        db.Job.update({pending: false}, {where: {id: job_id}})
    ])
  }).then(() => res.send({})).catch(next);
};