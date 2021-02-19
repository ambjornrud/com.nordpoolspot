const moment = require('moment-timezone');
const nordpool = require('../lib/nordpool');
const _ = require('lodash');

Promise.all([
    nordpool.getHourlyPrices(moment(), {priceArea: 'Bergen', currency: 'NOK'}),
    nordpool.getHourlyPrices(moment().add(1, 'days'), {priceArea: 'Bergen', currency: 'NOK'})
]).then(result => {
    let prices = result[0];
    Array.prototype.push.apply(prices, result[1]);
    console.log('prices', prices);
    console.log(prices.length);
}).catch(console.error);

