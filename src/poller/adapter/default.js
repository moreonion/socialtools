/**
 * DefaultAdapter module.
 *
 * @module poller/adapter/default
 */

/* global module:true */

module = (typeof module === 'undefined') ? {} : module;
/** Use the DefaultAdapterFn */
module.exports = DefaultAdapterFn;

/**
 * The default adapter function for the XHR response.
 *
 * The default adapter simply returns the response as-is.
 * No transformation is done.
 *
 * @constructor
 * @this {Poller}
 * @param {object} response - The response object
 * @returns {object}
 * @todo Write tutorial
 */
function DefaultAdapterFn(response) {
    return response;
}
