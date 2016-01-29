;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Null = factory();
  }
}(this, function() {
/**
 * NullAdapter module.
 *
 * @module poller/adapter/null
 */

/* global module:true */

module = (typeof module === 'undefined') ? {} : module;
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

return module.exports;
}));
