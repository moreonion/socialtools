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
