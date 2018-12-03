const moment = require('moment-timezone');
const nordpool = require('./lib/nordpool');
const _ = require('lodash');

nordpool.getHourlyPrices(moment(), {priceArea: 'Bergen', currency: 'NOK'})
    .then(prices => {
        nordpool.getHourlyPrices(moment().add(1, 'days'), {priceArea: 'Bergen', currency: 'NOK'})
            .then(pr2 => {
                Array.prototype.push.apply(prices, pr2);
                console.log('prices', prices);
                const currentHour = moment().format('YYYY-MM-DD\THH');
                const currentPrice = prices.find(p => moment(p.startsAt).format('YYYY-MM-DD\THH') === currentHour);
                console.log('currentPrice', currentPrice);
            }).catch(console.error);
    })
    .catch(console.error);

