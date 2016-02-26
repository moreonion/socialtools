/* global require describe it beforeEach before after */

var chai = require('chai');
var assert = chai.assert;
var Supporters = require('../build/umd/supporters/supporters');
var Poller = require('../build/umd/poller/poller');

var jsdom = require('jsdom-global');

describe('Supporters', function () {
    describe('constructor', function () {
        it('should be constructable with new', function () {
            var supporters = new Supporters();
            assert.ok(supporters instanceof Supporters);
        });

        it('should be constructable without new', function () {
            var supporters = Supporters(); // eslint-disable-line new-cap
            assert.ok(supporters instanceof Supporters);
        });
    });

    describe('initialization', function () {
    });

    describe('usage of Poller', function () {
        it('should be optional', function () {
            var supporters = new Supporters();
            assert.ok(supporters.poller === null);
        });

        it('should be optional by setting `poller` to `null`', function () {
            var supporters = new Supporters({ poller: null});
            assert.ok(supporters.poller === null);
        });

        it('should be settable to a already created Poller', function () {
            var myPoller = new Poller();
            var supporters = new Supporters({ poller: myPoller});
            assert.equal(myPoller, supporters.poller);
        });

        it('should create a new Poller if given poller options', function () {
            var supporters = new Supporters({ poller: {url: 'http://example.com'}});
            // a little brittle to test it this way, but the Poller constructor
            // here is not the same which was used to construct
            // progressbar.poller, which is not accessible here (internal to
            // poller)
            assert.equal('Poller', supporters.poller.constructor.name);
        });
    });

    describe('binding of element', function () {
        before(function () {
            this.jsdom = jsdom();
        });

        after(function () {
            this.jsdom(); // cleanup
        });

        beforeEach(function () {
            this.supporters = new Supporters();
            this.container = document.createElement('div');
            this.container.innerHTML = '<div id="container"></div>';
        });

        it('should return `true` if successful', function () {
            var returnValue = this.supporters.bindTo(this.container);
            assert.equal(true, returnValue);
        });

        it('should return `false` if failed', function () {
            var returnValue = this.supporters.bindTo('#non-existing', document);
            assert.equal(false, returnValue);
        });

        it('can bind to any given HTMLElement', function () {
            var el = document.createElement('div');
            var returnValue = this.supporters.bindTo(el);
            assert.equal(true, returnValue);
            assert.equal(el, this.supporters.el);
        });

        it('can bind to an HTML id', function () {
            var fragment = document.createDocumentFragment();
            fragment.appendChild(this.container);
            var returnValue = this.supporters.bindTo('#container', fragment);
            assert.equal('DIV', this.supporters.el.nodeName);
            assert.equal(true, returnValue);
        });

        it('can bind via an option of the constructor', function () {
            var el = document.createElement('div');
            var supporters = new Supporters({ el: el });
            assert.equal(el, supporters.el);
        });
    });

    describe('adding of supporters to store', function () {
        beforeEach(function () {
            this.supporters = new Supporters();
        });

        it('does not alter the store if given nothing or not an Array', function () {
            assert.equal(0, this.supporters.supporters.length);

            var returnValue = this.supporters.add();
            assert.equal(0, returnValue);
            assert.equal(0, this.supporters.supporters.length);

            returnValue = this.supporters.add('not-an-array');
            assert.equal(0, returnValue);
            assert.equal(0, this.supporters.supporters.length);

            returnValue = this.supporters.add({also: 'not-an-array'});
            assert.equal(0, returnValue);
            assert.equal(0, this.supporters.supporters.length);
        });

        it('returns the number of added supporters', function () {
            var signer = {name: 'Signer'};
            var returnValue = this.supporters.add([ signer ]);
            assert.equal(1, returnValue);
        });
    });
});

// vim: set et ts=4 sw=4 :
