'use strict';
const Sequelize = require('sequelize');
const cc = require('coupon-code');
const _ = require('lodash');

let Coupon = sequelize.define('coupons', {
  code: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: () => cc.generate({parts: 2})
  },
  sent: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  value: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1}
}, {
  classMethods: {
    generate(count) {
      let bulk = _.times(count || 1, () => {}); // empty object since all the defaults get applied above
      return Coupon.bulkCreate(bulk);
    },
    validate(code) {
      return Coupon.findOne({where: {code: {$iLike: code.toLowerCase()}}});
    },
    use(code) {

    }
  }
});

module.exports = Coupon;