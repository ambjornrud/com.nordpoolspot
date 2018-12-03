const moment = require('moment-timezone');
const nordpool = require('./lib/nordpool');

nordpool.getHourlyPrices({priceArea: 'Bergen', currency: 'NOK'})
    .then(prices => {
        console.log('prices', prices);

        var now = moment().format('YYYY-MM-DD HH');
        const currentPrice = prices.find(p => p.startsAt.format('YYYY-MM-DD HH') === now);

        console.log('currentPrice', currentPrice);
    })
    .catch(console.error);

