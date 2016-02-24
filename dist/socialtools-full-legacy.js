(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Socialtools = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.utils = factory();
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

},{}],2:[function(require,module,exports){
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.defaultAdapter = factory();
  }
}(this, function() {
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

return module.exports;
}));

},{}],3:[function(require,module,exports){
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../common/utils', './adapter/default'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('../common/utils'), require('./adapter/default'));
  } else {
    root.Poller = factory(root.utils, root.defaultAdapter);
  }
}(this, function(utils, DefaultAdapterFn) {
/**
 * Poller module.
 *
 * @module poller/poller
 * @requires ../common/utils
 * @requires ./adapter/default
 */

/* global Promise module:true promisePolyfill assignPolyfill removePolyfill utils DefaultAdapterFn */

module = (typeof module === 'undefined') ? {} : module;
/** Create a poller */
module.exports = Poller;

var root = this; // eslint-disable-line consistent-this

/**
 * Creates a Poller instance.
 *
 * @constructor
 * @this {Poller}
 * @param {object} options - the options
 * @param {string} options.url - the URL to poll
 * @param {string} [options.type='json'] - the type of the request, may be
 *     <code>json</code> or <code>jsonp</code>
 * @param {number} [options.pollInterval=10000] - the time between polls in
 *     milliseconds
 * @param {function} [options.adapter=DefaultAdapterFn] - the function which
 *     adapts the response
 * @param {function} [options.createEvent=true] - whether the poller should
 *     create an event
 * @param {function} [options.handler] - a handler which will get called with
 *     every successful poll
 * @public
 * @todo validate options, throw Error on invalid options
 */
function Poller(options) {
    // make it possible to use `Poller()` and `new Poller`
    if (!(this instanceof Poller)) return new Poller(options);

    /**
     * The default settings.
     * @var {object}
     * @inner
     */
    var defaults = {
        url: null,
        type: 'json',
        pollInterval: 10000,
        adapter: DefaultAdapterFn,
        createEvent: true,
        eventName: 'polled',
        callbackNamePrefixJSONP: 'pollerJSONPCallback',
        handler: null
    };

    /**
     * The active settings.
     * @member {object} settings
     * @instance
     * @memberof module:poller/poller~Poller
     */
    this.settings = Object.assign(defaults, options);

    /**
     * The interval of the poller instance.
     * @member {object} interval
     * @instance
     * @memberof module:poller/poller~Poller
     */
    this.interval = null;
}

/**
 * Get an URL via XHR.
 *
 * @method
 * @param {string} url - The URL to get.
 * @returns {Promise}
 */
Poller.prototype.get = function (url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        // @BROWSER: IE9
        // check for XHR2 and CORS and therefor also for .onload/.onerror callbacks
        // for IE9 (only with XDomainRequest)
        if ('withCredentials' in req) {
            req.open('GET', url, true);
        } else if ('XDomainRequest' in root) {
            req = new XDomainRequest();
            req.open('get', url);
        } else {
            reject(new Error('CORS not supported'));
        }

        req.onload = function () {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    resolve(req.response);
                }
                else {
                    reject(new Error(req.status + ' ' + req.statusText));
                }
            }
        };

        req.onerror = function () {
            reject(new Error('Network error'));
        };

        req.send();
    });
};

/**
 * Get an URL via XHR and parse the result as JSON.
 *
 * This method conveniently wraps {@link Poller#get} with a call to
 * <code>JSON.parse</code>
 *
 * @method
 * @param {string} url - The URL to get.
 * @returns {Promise}
 */
Poller.prototype.getJSON = function (url) {
    // transform via JSON.parse resolve callback
    return this.get(url).then(JSON.parse);
};

/**
 * Get an URL via JSONP and parse the result as JSON.
 *
 * This method conveniently wraps {@link Poller#get} with a call to
 * <code>JSON.parse</code>
 *
 * @method
 * @param {string} url - The URL to get.
 * @returns {Promise}
 * @todo possible to inject other document
 * @todo when to reject Promises
 */
Poller.prototype.getJSONP = function (url, global) {
    if (typeof global === 'undefined') {
        global = root;
    }
    // coerce callbackNamePrefix into a string
    var callbackNamePrefix = this.settings.callbackNamePrefixJSONP + '';
    var randomPart = '';
    var callbackName = callbackNamePrefix + randomPart;

    // try if prefix is of length 0 or
    if (callbackNamePrefix.length === 0) {
        var q = Math.floor(Math.random() * Date.now());
        randomPart = q.toString(36);
        callbackName = callbackNamePrefix + '_' + randomPart;
    }

    // try as long as we hit an unset identifier to use
    while (typeof global[callbackName] !== 'undefined') {
        var r = Math.floor(Math.random() * Date.now());
        randomPart = r.toString(36);
        callbackName = callbackNamePrefix + '_' + randomPart;
    }

    return new Promise(function (resolve) {
        var scriptEl = document.createElement('script');
        var requestUrl = utils.addQueryParams(url, {
            callback: callbackName
        });
        global[callbackName] = function (data) {
            // cleans itself when called
            delete global[callbackName];
            scriptEl.remove();
            resolve(data);
        };
        scriptEl.setAttribute('src', requestUrl);
        document.body.appendChild(scriptEl);
    });
};

/**
 * Handle the response.
 *
 * Handle the response by emitting an event and calling an optional callback.
 * The handler is called whith <code>this</code> set to the Poller instance and
 * the polled data provided as argument.
 *
 * @protected
 * @method
 * @param {object} data - the data which was polled
 * @fires module:poller/poller~Poller#polled
 */
Poller.prototype._handleResponse = function (data) {
    // trigger event
    // @BROWSER: IE9
    // we need to build the CustomEvent without the CustomEvent() constructor for
    // browser compatibility (IE9)

    if (this.settings.createEvent) {
        /**
         * polled Event.
         *
         * @event module:poller/poller~Poller#polled
         * @type {CustomEvent}
         * @param {object} details - the details of the CustomEvent
         * @param {object} details.data - the data of the response from the poll
         * @todo namespace event
         * @todo attach event to poller instance
         */
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(this.settings.eventName, true, true, { data: data });
        document.dispatchEvent(event);
    }

    // call handler if exists
    if (typeof this.settings.handler === 'function') {
        this.settings.handler.call(this, data);
    }
};

/**
 * Get JSON response and resolve the Promise.
 *
 * @protected
 * @method
 * @param {string} url - the URL to poll
 */
Poller.prototype._poll = function (url) {
    // transform via JSON.parse resolve callback
    var self = this;
    var pollCallbackName;
    if (this.settings.type === 'json') {
        pollCallbackName = 'getJSON';
    } else if (this.settings.type === 'jsonp') {
        pollCallbackName = 'getJSONP';
    }

    this[pollCallbackName](url).then(function (response) {
        self._handleResponse(self.settings.adapter.call(self, response));
    }, function (error) {
        throw new Error('Poller: Error: ' + error.message);
    });
};

/**
 * Start and stop the poller.
 *
 * The action can be <code>once</code>, <code>start</code> (default),
 * <code>stop</code> or <code>reset</code>.
 *
 * @public
 * @method
 * @param {string} [action=start] - The desired action
 */
Poller.prototype.poll = function (action) {
    if (typeof action === 'undefined' || action === 'start' || action === 'reset') {
        clearInterval(this.interval); // we want only one interval per poller

        // immediately do the first poll
        this._poll.call(this, this.settings.url);

        var self = this;
        this.interval = setInterval(function () {
            self._poll.call(self, self.settings.url);
        }, this.settings.pollInterval);
    } else if (action === 'once') {
        this._poll.call(this, this.settings.url);
    } else if (action === 'stop') {
        clearInterval(this.interval);
    }
};

// vim: set et ts=4 sw=4 :

return module.exports;
}));

},{"../common/utils":1,"./adapter/default":2}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.assignPolyfill = factory();
  }
}(this, function() {
/**
 * Object.assign() polyfill
 *
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 * @module polyfills/object/assign
 */

/* global module:true */

module = (typeof module === 'undefined') ? {} : module;
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

return module.exports;
}));

},{}],6:[function(require,module,exports){
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../common/utils', '../poller/poller'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('../common/utils'), require('../poller/poller'));
  } else {
    root.Progressbar = factory(root.utils, root.Poller);
  }
}(this, function(utils, Poller) {
/**
 * Progressbar module.
 *
 * @module progressbar/progressbar
 * @requires ../poller/poller
 * @requires ../common/utils
 */

/* global module:true assignPolyfill utils Poller:true */

module = (typeof module === 'undefined') ? {} : module;
/** Create a Progressbar */
module.exports = Progressbar;

var root = this; // eslint-disable-line consistent-this

/** Poller is a "soft" dependency
 *
 * If it is not defined we generate one adhoc of Progressbar
 */
if (typeof Poller === 'undefined') {
    var Poller = function () {};
}

/**
 * Creates a Progressbar instance.
 *
 * @constructor
 * @this {Progressbar}
 * @param {object} [options] - the options
 * @param {HTMLElement|string} [options.el] - the DOM Element or an
 *     querySelector representing it
 * @param {Array} [options.targets=[ 100, 1000, 10000 ]] - the targets (only
 *     positive numbers)
 * @param {number} [options.minDelta=0] - the threshhold when the next target should
 *     be used
 * @param {null|object|Poller} [options.poller] - The poller to use or the
 *     options for the poller. If the the value is of instance
 *     <code>Poller</code> it is used as-is; otherwise if it's a plain
 *     dictionary it is used as config object for the Poller instance which
 *     will get created.
 *
 *     If poller is not set or set to <code>null</code> no poller is associated
 *     with this progressbar and no binding of events or callbacks will be
 *     done.
 *
 *     If no poller is defined or this is set to <code>null</code>, no polling
 *     will occur.
 *
 *     For options see the
 *     [constructor options of Poller]{@link module:poller/poller~Poller}.
 * @param {string} [options.barSelector='.bar'] - the HTML class selector which
 *     selects the growing bar
 * @param {string} [options.barStyleAttr='width'] - the style attribute of the
 *     selected bar which get's the percentage applied (usually you will want
 *     to choose between <code>width</code> and <code>height</code>
 * @param {string} [options.counterSelector='.counter'] - the HTML class
 *     selector which selects counters
 * @param {string} [options.downCounterSelector='.down-counter'] - the HTML
 *     class selector which selects counters (the remaining count)
 * @todo <code>el</code> can be a collection
 * @todo validation of given options
 * @public
 */
function Progressbar(options) {
    // make it possible to use `Progressbar()` and `new Progressbar`
    if (!(this instanceof Progressbar)) return new Progressbar(options);

    /**
     * The default settings.
     * @var {object}
     * @inner
     */
    var defaults = {
        startCount: 0,
        targets: [ 100, 1000, 10000 ],
        minDelta: 0,
        poller: null,
        barSelector: '.bar',
        barStyleAttr: 'width',
        counterSelector: '.counter',
        downCounterSelector: '.down-counter',
        el: null
    };

    /**
     * The active settings.
     * @member {object} settings
     * @instance
     * @memberof module:progressbar/progressbar~Progressbar
     */
    this.settings = Object.assign(defaults, options);

    /**
     * The current count state. The targets are compared against this value.
     *
     * This is our store.
     *
     * @member {number} currentCount
     * @instance
     * @memberof module:progressbar/progressbar~Progressbar
     */
    this.currentCount = 0;

    /**
     * The used poller.
     * @member {Poller} poller
     * @instance
     * @memberof module:progressbar/progressbar~Progressbar
     */
    this.poller = null;

    if (typeof this.settings.poller === 'object' && this.settings.poller instanceof Poller) {
        this.poller = this.settings.poller;
    } else if (typeof this.settings.poller === 'object' && this.settings.poller !== null) {
        this.poller = new Poller(this.settings.poller);
    } else {
        this.poller = null;
    }

    /**
     * The bound HTMLElement.
     * @member {HTMLElement} el
     * @instance
     * @memberof module:progressbar/progressbar~Progressbar
     */
    this.el = null;

    if (this.settings.el) {
        this.bindTo(this.settings.el);
    }

    if (this.settings.startCount !== 0) {
        this.currentCount = utils.toInteger(this.settings.startCount);
    }
}


/**
 * Bind to an element container.
 *
 * Return <code>true</code> if the element was found and bound, returns
 * <code>false</code> in case of errors.
 *
 * @method
 * @param {HTMLElement|string} el - the DOM Element or an
 *     querySelector representing it
 * @param {Document|DocumentFragment} [document=root.document] - the Document
 *     or DocumentFragment to operate on.
 * @todo HTMLCollection
 * @returns {boolean}
 */
Progressbar.prototype.bindTo = function (el, doc) {
    // default document
    if (typeof doc === 'undefined') {
        doc = root.document;
    }

    if (typeof el === 'string') {
        this.el = doc.querySelector(el);
    }
    if (el instanceof HTMLElement) {
        this.el = el;
    }

    if (this.el) {
        return true;
    } else {
        return false;
    }
};

/**
 * Trigger an update of the progressbar widget.
 *
 * If the store was updated because the count changed, return
 * <code>true</code>. If the count did not change return <code>false</code>.
 *
 * @method
 * @param {number|string} count - the target count to update to.
 * @returns {boolean}
 * @todo update possible multiple counters inside the container
 */
Progressbar.prototype.update = function (count) {
    var newCount = utils.toInteger(count);

    if (newCount !== this.currentCount) {
        // something has changed
        this.currentCount = newCount;
        this.render();
        return true;
    } else {
        return false;
    }
};

/**
 * Render or re-render the bound element.
 *
 * Does nothing if no element is bound.
 *
 * @method
 */
Progressbar.prototype.render = function () {
    if (this.el) {
        var bar = this.el.querySelector(this.settings.barSelector);
        if (bar) {
            bar.style[this.settings.barStyleAttr] = this.percentageDone(true) + '%';
        }

        var counter = this.el.querySelector(this.settings.counterSelector);
        if (counter) {
            counter.textContent = this.currentCount;
        }

        var downCounter = this.el.querySelector(this.settings.downCounterSelector);
        if (downCounter) {
            downCounter.textContent = this.getMissingCount();
        }
    }
};

/**
 * Get the achievement in percentage.
 *
 * Returns a float, rounded to 2 decimal places and calculated with the current
 * target. Returns 100.00 at maximum.
 *
 * The return value can be negative if the currentCount happens to be negative.
 *
 * Does nothing if no element is bound.
 *
 * @param {boolean} [ceil=true] - should the result ceiled with 100 (percent)
 * @returns {float}
 * @method
 */
Progressbar.prototype.percentageDone = function (ceil) {
    if (typeof ceil === 'undefined') {
        ceil = true;
    }

    var target = utils.toInteger(this.currentTarget());
    if (target === 0 || target < 0) {
        return 0.00;
    }

    var achievement = this.currentCount / target;
    if (ceil && achievement > 1.00) {
        return 100.00;
    }

    // calculate from a 0.abcdef fraction to an ab.cd value
    return (Math.round(achievement * 100 * 100)) / 100;
};

/**
 * Get the current target.
 *
 * Returns the current target, i.e. the number to achieve, or 0 if none is
 * set. It will return the last target if the achievable targets are all
 * already achieved.
 *
 * @method
 * @todo If targets is a string turn it into an array
 * @todo special case when minDelta is set?
 * @todo change minDelta default to 1; different behaviour when 0 --> return
 *     same target
 * @returns {number}
 */
Progressbar.prototype.currentTarget = function () {
    // return 0 if no targets are configured
    if (this.settings.targets.length === 0) {
        return 0;
    }

    // find all target values which are *greater* than the currentCount
    // return the minimum of these, i.e. next target
    var self = this;
    var possibleTargets = this.settings.targets.filter(function (value) {
        return value > (this + self.settings.minDelta);
    }, this.currentCount);
    var possibleTarget = Math.min.apply(null, possibleTargets);

    if (!isNaN(possibleTarget) && isFinite(possibleTarget)) {
        return possibleTarget;
    } else {
        return this.settings.targets[this.settings.targets.length - 1];
    }
};

/**
 * Get the missing count.
 *
 * Returns the difference between the current count and the current target.
 * Returns 0 if no targets are defined.
 *
 * @method
 * @param {boolean} [floor=true] - should the result be ceiled with 0, i.e. no
 *     negative missing count
 * @returns {number}
 */
Progressbar.prototype.getMissingCount = function (floor) {
    if (typeof floor === 'undefined') {
        floor = true;
    }

    // return 0 if no targets are configured
    if (this.settings.targets.length === 0) {
        return 0;
    }

    var target = utils.toInteger(this.currentTarget());
    if (target === 0 || target < 0) {
        return 0;
    }

    var missing = target - this.currentCount;
    if (floor && missing < 0) {
        return 0;
    }

    return missing;
};

// vim: set et ts=4 sw=4 :

return module.exports;
}));

},{"../common/utils":1,"../poller/poller":3}],7:[function(require,module,exports){
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

return module.exports;
}));

},{"./common/utils":1,"./poller/poller":3,"./polyfills/element/remove":4,"./polyfills/object/assign":5,"./progressbar/progressbar":6,"es6-promise":9}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],9:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.1.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }
    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
      var parent = this;
      var state = parent._state;

      if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
        return this;
      }

      var child = new this.constructor(lib$es6$promise$$internal$$noop);
      var result = parent._result;

      if (state) {
        var callback = arguments[state - 1];
        lib$es6$promise$asap$$asap(function(){
          lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$es6$promise$then$$default &&
          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: lib$es6$promise$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (Array.isArray(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(this.promise, this._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var input   = this._input;

      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$es6$promise$promise$resolve$$default) {
        var then = lib$es6$promise$$internal$$getThen(entry);

        if (then === lib$es6$promise$then$$default &&
            entry._state !== lib$es6$promise$$internal$$PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === lib$es6$promise$promise$$default) {
          var promise = new c(lib$es6$promise$$internal$$noop);
          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        this._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, this._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":8}]},{},[7])(7)
});