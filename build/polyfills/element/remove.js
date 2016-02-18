;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.removePolyfill = factory();
  }
}(this, function() {
/**
 * DOM Element.prototype.remove() polyfill
 *
 * Call with <code>require('./polyfills/element/remove').polyfill();</code>
 * from your module.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
 * @module polyfills/element/remove
 */

/* global module:true window */

module = (typeof module === 'undefined') ? {} : module;
module.exports = { polyfill: remove };

/**
 * Removes an element.
 *
 * @todo window replaceable
 * @static
 */
function remove() {
    if (typeof window !== 'undefined' && !('remove' in window.Element.prototype)) {
        window.Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }
}

// vim: set et ts=4 sw=4 :

return module.exports;
}));
