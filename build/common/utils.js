;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Utils = factory();
  }
}(this, function() {
/**
 * Module for utilty functions.
 *
 * A collection of helper functions, written in functional style.
 *
 * @module common/utils
 */

/*global module:true */

module = (typeof module === 'undefined') ? {} : module;
module.exports = {
    toInteger: toInteger,
    serializeToQueryString: serializeToQueryString,
    parseQueryString: parseQueryString,
    addQueryParams: addQueryParams
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

/**
 * Serializes an object as query parameter string
 *
 * @param {object} obj - the object to serialize
 * @returns {object}
 * @static
 */
function serializeToQueryString(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    }
    return str.join('&');
}

/**
 * Parses a string as query parameters
 *
 * @param {string} string - the string to parse
 * @returns {object}
 * @static
 */
function parseQueryString(string) {
    if (typeof string !== 'string') {
        string = '';
    }
    var vars = string.split('&');
    var params = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (!pair[0]) {
            continue;
        }
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return params;
}

/**
 * Transforms an URL into one with additional query parameters
 *
 * @param {string} url - the url to transform
 * @param {object} params - the dictionary of key-value pairs to append as
 *     query parameters
 * @returns {string}
 * @static
 * @todo make this less dependent on DOM functions like parseQueryString
 * @todo optionally apply key transforms
 * @todo add elements if key is an array[]
 * @todo maybe use Array.prototype.forEach()
 */
function addQueryParams(url, params) {
    if (typeof url === 'undefined') {
        return url;
    }
    if (typeof params !== 'object') {
        // nothing to do here
        return url;
    }

    var tmpUrl = document.createElement('a');
    tmpUrl.href = url;

    // add our params to the URLs params
    var newParams = parseQueryString(tmpUrl.search.substring(1));
    for (param in params) { // eslint-disable-line no-undef
        newParams[param] = params[param];  // eslint-disable-line no-undef
    }
    tmpUrl.search = '?' + serializeToQueryString(newParams);
    return tmpUrl.href;
}

// vim: set et ts=4 sw=4 :

return module.exports;
}));
