;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['es6-promise', './polyfills/object/assign', './polyfills/element/remove', './common/utils', './progressbar/progressbar', './poller/poller'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('es6-promise'), require('./polyfills/object/assign'), require('./polyfills/element/remove'), require('./common/utils'), require('./progressbar/progressbar'), require('./poller/poller'));
  } else {
    root.Socialtools = factory(root.promisePolyfill, root.assignPolyfill, root.removePolyfill, root.utils, root.Progressbar, root.Poller);
  }
}(this, function(promisePolyfill, assignPolyfill, removePolyfill, utils, Progressbar, Poller) {
/**
 * The Socialtools "legacy" bundle.
 *
 * This includes all the Socialtools and adds polyfills to support older
 * browsers.
 *
 * Currently IE9+, Edge, Chrome, Firefox and Safari are supported.
 *
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

return module.exports;
}));
