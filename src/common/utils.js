/**
 * Module for utilty functions.
 *
 * @module common/utils
 */

/*global module */

module.exports = {
    toInteger: toInteger
};

/**
 * Converts a string or number to an integer.
 *
 * In difference to <code>parseInt()</code> this will always return a
 * <code>number</code> object. If the string would evaluate to
 * <code>Infinity</code> or <code>NaN</code>, simply <code>0</code> is
 * returned.
 *
 * @param {number|string} numberOrString - a number or string
 * @param {number} [base=10] - the base for the number parsing
 * @returns {number}
 * @static
 */
function toInteger(numberOrString, base) {
    var converted = parseInt(numberOrString, base);

    if (isNaN(converted) || ! isFinite(converted)) {
        return 0;
    } else {
        return converted;
    }
}

// vim: set et ts=4 sw=4 :
