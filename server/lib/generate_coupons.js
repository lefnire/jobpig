const nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });
const Coupon = require('../models/index').Coupon;

Coupon.generate(nconf.get("COUPON_CT") || 10).then(() => process.exit(0)).catch(err => {throw err});