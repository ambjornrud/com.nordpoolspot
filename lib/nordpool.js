const moment = require('moment-timezone');
const rp = require('request-promise');

async function getHourlyPrices(opts) {
    var today = moment();
    var options = {
        uri: 'http://www.nordpoolspot.com/api/marketdata/page/10?' +
            'currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency +
            '&endDate=' + today.format('DD-MM-YYYY'),
        json: true
    };
    return new Promise((resolve, reject) => {
        rp(options)
            .then(function (data) {
                resolve(parseResult(data, opts));
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

function parseResult(data, opts) {
    var result = [];
    if (data.data && data.data.Rows && data.data.Rows.length) {
        for (var i = 0; i < data.data.Rows.length; i++) {
            var row = data.data.Rows[i];
            if (row.IsExtraRow) {
                continue;
            }

            var date = moment.tz(row.StartTime, "YYYY-MM-DD\Thh:mm:ss", 'Europe/Oslo');

            for (var j = 0; j < row.Columns.length; j++) {
                var column = row.Columns[j];
                var value = parseFloat(column.Value.replace(/,/, '.'));
                if (isNaN(value)) {
                    continue
                }
                if (column.Name === opts.priceArea) {
                    result.push({
                        startsAt: date,
                        priceArea: opts.priceArea,
                        currency: opts.currency,
                        price: value
                    })
                }
            }
        }
    }
    return result;
}

module.exports = {
    getHourlyPrices: getHourlyPrices
};
