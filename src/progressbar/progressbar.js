/**
 * Progressbar module.
 *
 * @module progressbar/progressbar
 * @requires ../poller/poller
 * @requires ../common/utils
 */

/* global module:true assignPolyfill utils Poller */

module = (typeof module === 'undefined') ? {} : module;
/** Create a Progressbar */
module.exports = Progressbar;

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
        targets: [ 100, 1000, 10000 ],
        minDelta: 0,
        poller: null,
        barSelector: '.bar',
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
 * @param {Document|DocumentFragment} [document=window.document] - the Document
 *     or DocumentFragment to operate on.
 * @todo HTMLCollection
 * @returns {boolean}
 */
Progressbar.prototype.bindTo = function (el, doc) {
    // default document
    if (typeof doc === 'undefined') {
        doc = window.document;
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
            bar.style.width = this.percentageDone(true) + '%';
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
