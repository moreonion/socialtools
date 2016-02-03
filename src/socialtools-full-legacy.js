/**
 * The Socialtools "legacy" bundle.
 *
 * This includes all the Socialtools and adds polyfills to support older
 * browsers.
 *
 * Currently IE9+, Edge, Chrome, Firefox and Safari are supported.
 *
 * @module socialtools-full-legacy
 * @requires es6-promise
 * @requires ./polyfills/object/assign
 * @requires ./polyfills/element/remove
 */

/* global module:true utils Poller Progressbar promisePolyfill assignPolyfill removePolyfill */

module = (typeof module === 'undefined') ? {} : module;
module.exports = {
    utils: utils,
    Poller: Poller,
    Progressbar: Progressbar
};

/** Promise polyfill */
promisePolyfill.polyfill();
/** Obejct.assign() polyfill */
assignPolyfill.polyfill();
/** Element.prototype.remove() polyfill */
removePolyfill.polyfill();

// vim: set et ts=4 sw=4 :
