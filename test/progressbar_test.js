/* global require describe it beforeEach */

var chai = require('chai');
var assert = chai.assert;
var Progressbar = require('../src/progressbar/progressbar');
var Poller = require('../src/poller/poller');

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
});

// vim: set et ts=4 sw=4 :
