/**
 * Object.assign() polyfill
 *
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 * @module polyfills/object/assign
 */

/* global module window */

module.exports = { polyfill: assign };

/**
 * Merges properties from sources into a target object.
 *
 * @static
 */
function assign() {
    if (typeof Object.assign != 'function') {
        (function () {
            Object.assign = function (target) {
                'use strict';
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }
}

// vim: set et ts=4 sw=4 :
