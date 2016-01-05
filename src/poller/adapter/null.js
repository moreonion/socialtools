/**
 * NullAdapter module.
 *
 * @module poller/adapter/null
 */

/* global module */

/** Use the NullAdapterFn */
module.exports = NullAdapterFn;

/**
 * A null adapter function for the XHR response.
 *
 * The null adapter returns nothing, i.e. <code>null</code>.
 * Not sure about use cases.
 *
 * @constructor
 * @this {Poller}
 * @returns {null}
 */
function NullAdapterFn() {
    return null;
}
