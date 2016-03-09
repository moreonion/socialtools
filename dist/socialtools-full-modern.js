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
 * @param {string} [options.targetSelector='.target'] - the HTML class
 *     selector which selects elements that should display the current target
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
        targetSelector: '.target',
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

        var i, counters = this.el.querySelectorAll(this.settings.counterSelector);
        for (i = 0; i < counters.length; i++) {
            counters[i].textContent = this.currentCount;
        }

        var downCounters = this.el.querySelectorAll(this.settings.downCounterSelector);
        var missingCount = this.getMissingCount();
        for (i = 0; i < downCounters.length; i++) {
            downCounters[i].textContent = missingCount;
        }

        var targets = this.el.querySelectorAll(this.settings.targetSelector);
        var currentTarget = this.currentTarget();
        for (i = 0; i < targets.length; i++) {
            targets[i].textContent = currentTarget;
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

},{"../common/utils":1,"../poller/poller":3}],5:[function(require,module,exports){
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

},{"./common/utils":1,"./poller/poller":3,"./progressbar/progressbar":4}]},{},[5])(5)
});