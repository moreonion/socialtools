/**
 * Progressbar module.
 *
 * @module progressbar/progressbar
 */

/* global module require */

/** Create a Progressbar */
module.exports = Progressbar;

var extend = require('lodash/object/extend');

var Poller = require('../poller/poller');

/**
 * Creates a Progressbar instance.
 *
 * @constructor
 * @this {Progressbar}
 * @param {object} [options] - the options
 * @param {Array} [options.targets=[ 100, 1000, 10000 ]] - the targets
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
        poller: null
    };

    /**
     * The active settings.
     * @member {object} settings
     * @instance
     * @memberof module:progressbar/progressbar~Progressbar
     */
    this.settings = extend(defaults, options);

    /**
     * The current count state. The targets are compared against this value.
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
}


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

// vim: set et ts=4 sw=4 :
