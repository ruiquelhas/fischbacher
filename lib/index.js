'use strict';

const Lafayette = require('lafayette');
const Supervizor = require('supervizor');

const internals = {};

internals.register = async function (server, options) {

    return await server.register({
        plugin: Supervizor,
        options: {
            validator: Lafayette.validate,
            whitelist: options.whitelist
        }
    });
};

module.exports = {
    pkg: require('../package.json'),
    register: internals.register
};
