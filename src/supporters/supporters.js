/**
 * Supporters module.
 *
 * @module supporters/supporters
 * @requires ../poller/poller
 */

/* global module:true Poller:true */

module = (typeof module === 'undefined') ? {} : module;
/** Create a Supporters */
module.exports = Supporters;

var root = this; // eslint-disable-line consistent-this

/** Poller is a "soft" dependency
 *
 * If it is not defined we generate one adhoc for Supporters
 */
if (typeof Poller === 'undefined') {
    var Poller = function () {};
}

/**
 * Creates a Supporters instance.
 *
 * @constructor
 * @this {Supporters}
 * @param {object} [options] - the options
 * @param {HTMLElement|string} [options.el] - the DOM Element or an
 *     querySelector representing it
 * @param {null|object|Poller} [options.poller] - The poller to use or the
 *     options for the poller. If the the value is of instance
 *     <code>Poller</code> it is used as-is; otherwise if it's a plain
 *     dictionary it is used as config object for the Poller instance which
 *     will get created.
 *
 *     If poller is not set or set to <code>null</code> no poller is associated
 *     with this supporters and no binding of events or callbacks will be
 *     done.
 *
 *     If no poller is defined or this is set to <code>null</code>, no polling
 *     will occur.
 *
 *     For options see the
 *     [constructor options of Poller]{@link module:poller/poller~Poller}.
 * @todo <code>el</code> can be a collection
 * @todo validation of given options
 * @public
 */
function Supporters(options) {
    // make it possible to use `Supporters()` and `new Supporters`
    if (!(this instanceof Supporters)) return new Supporters(options);

    /**
     * The default settings.
     * @var {object}
     * @inner
     */
    var defaults = {
        poller: null,
        el: null
    };

    /**
     * The active settings.
     * @member {object} settings
     * @instance
     * @memberof module:supporters/supporters~Supporters
     */
    this.settings = Object.assign(defaults, options);

    /**
     * The used poller.
     * @member {Poller} poller
     * @instance
     * @memberof module:supporters/supporters~Supporters
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
     * @memberof module:supporters/supporters~Supporters
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
 * @param {Document|DocumentFragment} [document=root.document] - the Document
 *     or DocumentFragment to operate on.
 * @todo HTMLCollection
 * @returns {boolean}
 */
Supporters.prototype.bindTo = function (el, doc) {
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

// vim: set et ts=4 sw=4 :
