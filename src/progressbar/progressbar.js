/**
 * Progressbar module.
 *
 * @module progressbar/progressbar
 */

/* global module require */

/** Create a Progressbar */
module.exports = Progressbar;

var extend = require('lodash/object/extend');

var Poller = require('../poller/poller');

/**
 * Creates a Progressbar instance.
 *
 * @constructor
 * @this {Progressbar}
 * @param {object} options - the options
 * @param {object|Poller} options.poller - The poller to use or the options for
 *     the poller. If the the value is of instance <code>Poller</code> it is used
 *     as-is; otherwise if it's a plain dictionary it is used as config object for
 *     the Poller instance which will get created.
 * @param {string} options.poller.url - the URL to poll
 * @param {number} [options.poller.pollInterval=10000] - the time between polls
 *     in milliseconds
 * @param {function} [options.poller.adapter=DefaultAdapterFn] - the function
 *     which adapts the response
 * @param {function} [options.poller.handler] - a handler which will get called
 *     with every successful poll
 * @public
 */
function Progressbar(options) {
    // make it possible to use `Progressbar()` and `new Progressbar`
    if (!(this instanceof Progressbar)) return new Progressbar(options);

    var defaults = {
        poller: null
    };
    this.settings = extend(defaults, options);
}

// vim: set et ts=4 sw=4 :
