'use strict';

const Homey = require('homey'),
    _ = require('lodash'),
    moment = require('moment'),
    nordpool = require('../../lib/nordpool');

class NordpoolDevice extends Homey.Device {

    onInit() {

        this._lastPrice = undefined;

        this._priceChangedTrigger = new Homey.FlowCardTriggerDevice('price_changed');
        this._priceChangedTrigger.register();

        this._priceBelowAvgTrigger = new Homey.FlowCardTriggerDevice('price_below_avg');
        this._priceBelowAvgTrigger
            .register()
            .registerRunListener(this._priceAvgComparer.bind(this));

        this._priceAboveAvgTrigger = new Homey.FlowCardTriggerDevice('price_above_avg');
        this._priceAboveAvgTrigger
            .register()
            .registerRunListener(this._priceAvgComparer.bind(this));

        this._priceAtLowestTrigger = new Homey.FlowCardTriggerDevice('price_at_lowest');
        this._priceAtLowestTrigger
            .register()
            .registerRunListener(this._priceMinMaxComparer.bind(this));

        this._priceAtHighestTrigger = new Homey.FlowCardTriggerDevice('price_at_highest');
        this._priceAtHighestTrigger
            .register()
            .registerRunListener(this._priceMinMaxComparer.bind(this));

        this._currentPriceBelowCondition = new Homey.FlowCardCondition('current_price_below');
        this._currentPriceBelowCondition
            .register()
            .registerRunListener(args => args.price > _.get(this._lastPrice, 'price'));

        this.log('Device has been initialized', this.getName());

        this.fetchData();
    }

    async fetchData() {
        let settings = this.getSettings();
        let priceArea = settings.priceArea || 'Oslo';
        this.log('fetchData: ', this.getData().id, settings, priceArea);

        nordpool.getHourlyPrices(moment(), {priceArea: priceArea, currency: 'NOK'})
            .then(prices => {
                nordpool.getHourlyPrices(moment().add(1, 'days'), {priceArea: priceArea, currency: 'NOK'})
                    .then(pr2 => {
                        Array.prototype.push.apply(prices, pr2);
                        this.scheduleFetchData(120);
                        return this.onData(prices);
                    })
                    .catch(err => {
                        console.error(err);
                        this.scheduleFetchData(120);
                    });
            })
            .catch(err => {
                console.error(err);
                this.scheduleFetchData(120);
            });
    }

    scheduleFetchData(seconds) {
        this.log(`Fetching data in ${seconds} seconds`);
        setTimeout(this.fetchData.bind(this), seconds * 1000);
    }

    async onData(prices) {

        const currentHour = moment().format('YYYY-MM-DD\THH');
        const currentPrice = prices.find(p => moment(p.startsAt).format('YYYY-MM-DD\THH') === currentHour);

        this.log('currentPrice', currentPrice.startsAt, currentPrice.price);

        if (!this._lastPrice || currentPrice.startsAt !== this._lastPrice.startsAt) {
            this._lastPrice = currentPrice;
            this._priceChangedTrigger.trigger(this, currentPrice);
            this.setCapabilityValue("price", currentPrice.price).catch(console.error);
            this.log('Triggering price_changed', currentPrice);

            this._priceBelowAvgTrigger.trigger(this, null, {
                below: true,
                currentPrice: currentPrice,
                priceInfoNextHours: prices
            }).catch(console.error);

            this._priceAboveAvgTrigger.trigger(this, null, {
                below: false,
                currentPrice: currentPrice,
                priceInfoNextHours: prices
            }).catch(console.error);

            this._priceAtLowestTrigger.trigger(this, null, {
                lowest: true,
                currentPrice: currentPrice,
                priceInfoNextHours: prices
            }).catch(console.error);

            this._priceAtHighestTrigger.trigger(this, null, {
                lowest: false,
                currentPrice: currentPrice,
                priceInfoNextHours: prices
            }).catch(console.error);

        }
    }

    _priceAvgComparer(args, state) {
        if (!args.hours) {
            return false;
        }

        const now = moment();
        let avgPriceNextHours = _(state.priceInfoNextHours)
            .filter(p => args.hours > 0 ? moment(p.startsAt).isAfter(now) : moment(p.startsAt).isBefore(now))
            .take(Math.abs(args.hours))
            .meanBy(x => x.price);

        let diffAvgCurrent = (state.currentPrice.price - avgPriceNextHours) / avgPriceNextHours * 100;
        if (state.below) {
            diffAvgCurrent = diffAvgCurrent * -1;
        }

        this.log(`${state.currentPrice.price.toFixed(2)} is ${diffAvgCurrent.toFixed(2)}% ${args.below ? 'below' : 'above'} avg (${avgPriceNextHours.toFixed(2)}) next ${args.hours} hours. Condition of min ${args.percentage} percentage met = ${diffAvgCurrent > args.percentage}`);
        return diffAvgCurrent > args.percentage;
    }

    _priceMinMaxComparer(args, state) {
        if (!args.hours) {
            return false;
        }

        const now = moment();
        let pricesNextHours = _(state.priceInfoNextHours)
            .filter(p => args.hours > 0 ? moment(p.startsAt).isAfter(now) : moment(p.startsAt).isBefore(now))
            .take(Math.abs(args.hours))
            .value();

        const toCompare = state.lowest ? _.minBy(pricesNextHours, 'price').price
            : _.maxBy(pricesNextHours, 'price').price;

        const conditionMet = state.lowest ? state.currentPrice.price <= toCompare
            : state.currentPrice.price >= toCompare;

        this.log(`${state.currentPrice.price.toFixed(2)} is ${state.lowest ? 'lower than the lowest' : 'higher than the highest'} (${toCompare}) among the next ${args.hours} hours = ${conditionMet}`);
        return conditionMet;
    }

}

module.exports = NordpoolDevice;