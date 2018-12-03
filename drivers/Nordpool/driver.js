'use strict';

const Homey = require('homey');

class NordpoolDriver extends Homey.Driver {

    onInit() {
        this.log('Nordpool driver has been initialized');
    }

    onPairListDevices(data, callback) {
        let devices = [
            {
                "name": "Nordpool",
                "data": {"id": "Nordpool"}
            }
        ];
        callback(null, devices);
    }

}

module.exports = NordpoolDriver;