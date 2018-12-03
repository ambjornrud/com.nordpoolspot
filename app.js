'use strict';

const Homey = require('homey');

class Nordpool extends Homey.App {

    onInit() {
        this.log('Nordpool is running...');
    }

}

module.exports = Nordpool;