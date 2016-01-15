/* global require describe it beforeEach global */

var chai = require('chai');
var assert = chai.assert;
var Progressbar = require('../src/progressbar/progressbar');
var Poller = require('../src/poller/poller');

var jsdom = require('mocha-jsdom');

describe('Progressbar', function () {
    describe('constructor', function () {
        it('should be constructable with new', function () {
            var progressbar = new Progressbar();
            assert.ok(progressbar instanceof Progressbar);
        });

        it('should be constructable without new', function () {
            var progressbar = Progressbar(); // eslint-disable-line new-cap
            assert.ok(progressbar instanceof Progressbar);
        });
    });

    describe('usage of Poller', function () {
        it('should be optional', function () {
            var progressbar = new Progressbar();
            assert.ok(progressbar.poller === null);
        });

        it('should be optional by setting `poller` to `null`', function () {
            var progressbar = new Progressbar({ poller: null});
            assert.ok(progressbar.poller === null);
        });

        it('should be settable to a already created Poller', function () {
            var myPoller = new Poller();
            var progressbar = new Progressbar({ poller: myPoller});
            assert.equal(myPoller, progressbar.poller);
        });

        it('should create a new Poller if given poller options', function () {
            var progressbar = new Progressbar({ poller: {url: 'http://example.com'}});
            // a little brittle to test it this way, but the Poller constructor
            // here is not the same which was used to construct
            // progressbar.poller, which is not accessible here (internal to
            // poller)
            assert.equal('Poller', progressbar.poller.constructor.name);
        });
    });

    describe('calculation of default targets', function () {
        beforeEach(function () {
            this.progressbar = new Progressbar();
        });

        it('should return 100 by default', function () {
            assert.equal(100, this.progressbar.currentTarget());
        });

        it('should return 1000 as second target by default', function () {
            var target = this.progressbar.settings.targets[0];
            this.progressbar.currentCount = target + 1;
            assert.equal(1000, this.progressbar.currentTarget());
        });

        it('should return a greater target if the exact target count is hit', function () {
            var target = this.progressbar.settings.targets[0];
            this.progressbar.currentCount = target;
            assert.isBelow(target, this.progressbar.currentTarget());
            assert.notEqual(target, this.progressbar.currentTarget());
        });

    });

    describe('calculation of target', function () {
        it('should return configurable targets', function () {
            var progressbar = new Progressbar({
                targets: [ 23, 42, 127 ]
            });
            assert.equal(23, progressbar.currentTarget());
            progressbar.currentCount = 23;
            assert.equal(42, progressbar.currentTarget());
        });

        it('should return the last target when possible targets are exceeded', function () {
            var progressbar = new Progressbar({
                targets: [ 23, 42, 127 ]
            });
            progressbar.currentCount = 10000;
            assert.equal(127, progressbar.currentTarget());
        });

        it('should return 0 if no targets are set', function () {
            var progressbar = new Progressbar({
                targets: []
            });
            assert.equal(0, progressbar.currentTarget());
        });
    });

    describe('calculation of percentage done', function () {
        beforeEach(function () {
            this.progressbar = new Progressbar({
                targets: [ 100, 777, 1000 ]
            });
        });

        it('should be 0 on start', function () {
            assert.equal(0, this.progressbar.percentageDone());
        });

        it('should be 100 at max', function () {
            this.progressbar.update(100000);
            assert.equal(100, this.progressbar.percentageDone());
        });

        it('could be without ceiling', function () {
            this.progressbar.update(100000);
            assert.isBelow(100, this.progressbar.percentageDone(false));
        });

        it('rounds to 2 decimal places', function () {
            this.progressbar.update(553);
            assert.equal(71.17, this.progressbar.percentageDone());
            this.progressbar.update(555);
            assert.equal(71.43, this.progressbar.percentageDone());
        });
    });

    describe('calculation of missing count', function () {
        beforeEach(function () {
            this.progressbar = new Progressbar({
                targets: [ 100, 1000 ]
            });
        });

        it('should be 100 on start', function () {
            assert.equal(100, this.progressbar.getMissingCount());
        });

        it('should be 0 at max', function () {
            this.progressbar.update(100000);
            assert.equal(0, this.progressbar.getMissingCount());
        });

        it('could be without flooring', function () {
            this.progressbar.update(100000);
            assert.isAbove(0, this.progressbar.getMissingCount(false));
        });

        it('returns 0 if no targets are set', function () {
            var progressbar = new Progressbar({
                targets: []
            });
            assert.equal(0, progressbar.getMissingCount());
        });

        it('returns 0 if targets is 0', function () {
            var progressbar = new Progressbar({
                targets: [ 0 ]
            });
            assert.equal(0, progressbar.getMissingCount());
        });

        it('returns 0 if targets is below 0', function () {
            var progressbar = new Progressbar({
                targets: [ -10 ]
            });
            assert.equal(0, progressbar.getMissingCount());
        });
    });

    describe('binding of element', function () {
        jsdom();

        beforeEach(function () {
            this.progressbar = new Progressbar();
            this.container = document.createElement('div');
            this.container.innerHTML = '<div id="container"></div>';
        });

        it('should return `true` if successful', function () {
            var returnValue = this.progressbar.bindTo(this.container);
            assert.equal(true, returnValue);
        });

        it('should return `false` if failed', function () {
            var returnValue = this.progressbar.bindTo('#non-existing', global.document);
            assert.equal(false, returnValue);
        });

        it('can bind to any given HTMLElement', function () {
            var el = global.document.createElement('div');
            var returnValue = this.progressbar.bindTo(el);
            assert.equal(true, returnValue);
            assert.equal(el, this.progressbar.el);
        });

        it('can bind to an HTML id', function () {
            var fragment = document.createDocumentFragment();
            fragment.appendChild(this.container);
            var returnValue = this.progressbar.bindTo('#container', fragment);
            assert.equal('DIV', this.progressbar.el.nodeName);
            assert.equal(true, returnValue);
        });

        it('can bind via an option of the constructor', function () {
            var el = global.document.createElement('div');
            var progressbar = new Progressbar({ el: el });
            assert.equal(el, progressbar.el);
        });
    });

    describe('updating of store', function () {
        beforeEach(function () {
            this.progressbar = new Progressbar();
        });

        it('returns true if the count changed', function () {
            assert.equal(0, this.progressbar.currentCount);
            var returnValue = this.progressbar.update(12);
            assert.equal(true, returnValue);
        });

        it('returns false if the count did not change', function () {
            assert.equal(0, this.progressbar.currentCount);
            var returnValue = this.progressbar.update(12);
            assert.equal(true, returnValue);
            returnValue = this.progressbar.update(12);
            assert.equal(false, returnValue);
        });
    });

    describe('updating of container', function () {
        jsdom();

        beforeEach(function () {
            this.container = document.createElement('div');
            this.container.innerHTML = '<div><div class="counter">0</div></div>';
        });

        it('should update a container counter', function () {
            var progressbar = new Progressbar();
            assert.equal('0', this.container.querySelector('.counter').innerHTML);
            progressbar.bindTo(this.container);
            progressbar.update(12);
            assert.equal('12', this.container.querySelector('.counter').innerHTML);
        });
    });
});

// vim: set et ts=4 sw=4 :
