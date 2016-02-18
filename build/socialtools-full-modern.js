;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./common/utils', './progressbar/progressbar', './poller/poller'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('./common/utils'), require('./progressbar/progressbar'), require('./poller/poller'));
  } else {
    root.Socialtools = factory(root.utils, root.Progressbar, root.Poller);
  }
}(this, function(utils, Progressbar, Poller) {
/**
 * The Socialtools "modern" bundle.
 *
 * This includes all the Socialtools.
 * browsers.
 *
 * Only "modern" browsers, i.e. browsers with support of at least ES5 and some newer features like Promises or XHR2, are supported but this bundle.
 *
 * Currently Edge, Chrome, Firefox and Safari are supported.
 *
 * @module socialtools-full-modern
 */

/* global module:true utils Poller Progressbar */

module = (typeof module === 'undefined') ? {} : module;
module.exports = {
    utils: utils,
    Poller: Poller,
    Progressbar: Progressbar
};

// vim: set et ts=4 sw=4 :

return module.exports;
}));
