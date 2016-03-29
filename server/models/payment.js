'use strict';
const Sequelize = require('sequelize');

let Payment = sequelize.define('payments', {
  txn_id: {type: Sequelize.STRING,allowNull: false}
});

module.exports = Payment;