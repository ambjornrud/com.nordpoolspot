'use strict';

const moment = require('moment-timezone');
const nordpool = require('../lib/nordpool');
const _ = require('lodash');

let handleData = function (prices, low_hours, num_hours, startingHour) {
    const now = moment();
    const startingAt = moment().hours(startingHour).minutes(0).second(0).millisecond(0);

    let onNowOrOff = _(prices)
        .filter(p => moment(p.startsAt).isSameOrAfter(startingAt))
        .take(num_hours)
        .sortBy(['price'])
        .take(low_hours)
        .filter(p => moment(p.startsAt).isBefore(now) && moment(p.startsAt).add(1, 'hours').minutes(0).second(0).millisecond(0).isAfter(now))
        .size() === 1;

    console.log('onNowOrOff ', onNowOrOff);
};

Promise.all([
    nordpool.getHourlyPrices(moment(), {priceArea: 'Bergen', currency: 'NOK'}),
    nordpool.getHourlyPrices(moment().add(1, 'days'), {priceArea: 'Bergen', currency: 'NOK'})
]).then(result => {
    let prices = result[0];
    Array.prototype.push.apply(prices, result[1]);
    handleData(prices, 12, 12, 8);
}).catch(console.error);



