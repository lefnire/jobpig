'use strict';
const nconf = require('nconf');
const db = require('../models/models');
const _ = require('lodash');
const stripe = require('stripe')(nconf.get('stripe:private'));

exports.validate = (req, res, next) => {
  // Create a new customer and then a new charge for that customer:
  let token = req.body.token;
  stripe.customers.create({
    email: token.email,
    source: token.id
  }).then(customer => {
    return stripe.charges.create({
      amount: 10000,
      currency: 'usd',
      customer: customer.id
    })
  }).then(charge => {
    debugger;
    // New charge created on a new customer
    // TODO
  }).catch(next);
};