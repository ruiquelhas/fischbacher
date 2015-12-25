'use strict';

const Lafayette = require('lafayette');
const Supervizor = require('supervizor');

exports.register = function (server, options, next) {

    const plugin = {
        register: Supervizor,
        options: {
            validator: Lafayette.validate,
            whitelist: options.whitelist
        }
    };

    server.register(plugin, next);
};

exports.register.attributes = {
    pkg: require('../package.json')
};
