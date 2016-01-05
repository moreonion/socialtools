/* global require describe it beforeEach afterEach */

var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
var Poller = require('../src/poller/poller');

describe('Poller', function () {
    describe('constructor', function () {
        it('should be constructable with new', function () {
            var poller = new Poller();
            assert.ok(poller instanceof Poller);
        });
        it('should be constructable without new', function () {
            var poller = Poller(); // eslint-disable-line new-cap
            assert.ok(poller instanceof Poller);
        });
    });
    describe('polling', function () {
        beforeEach(function () {
            this.clock = sinon.useFakeTimers();
            var url = 'https://api.example.com/some/endpoint';
            this.poller = new Poller({
                url: url,
                pollInterval: 2000
            });
            this.stub = sinon.stub(this.poller, '_poll', function () {});

        });

        afterEach(function () {
            this.clock.restore();
            this.stub.restore();
        });

        it('starts immediately after the call', function () {
            this.poller.poll();
            assert.ok(this.stub.calledOnce);
        });

        it('with an interval after starting', function () {
            this.poller.poll();
            assert.ok(this.stub.calledOnce);
            this.clock.tick(2100);
            assert.ok(this.stub.calledTwice);
            this.clock.tick(2000);
            assert.ok(this.stub.calledThrice);
        });

        it('is startable with "start"', function () {
            this.poller.poll('start');
            assert.ok(this.stub.calledOnce);
        });

        it('is resetable after started', function () {
            this.poller.poll('start');
            assert.ok(this.stub.calledOnce);
            this.clock.tick(2100);
            assert.ok(this.stub.calledTwice);
            // note the missing clock tick here
            this.poller.poll('reset');
            assert.ok(this.stub.calledThrice);
        });

        // MAYBE CHANGE
        it('calling with "start" twice is same as "reset"', function () {
            this.poller.poll('start');
            assert.ok(this.stub.calledOnce);
            this.clock.tick(2100);
            assert.ok(this.stub.calledTwice);
            // note the missing clock tick here
            this.poller.poll('reset');
            assert.ok(this.stub.calledThrice);
        });

        it('is stopptable with "stop"', function () {
            this.poller.poll('start');
            assert.ok(this.stub.calledOnce);
            this.clock.tick(2100);
            assert.ok(this.stub.calledTwice);
            this.poller.poll('stop');
            this.clock.tick(2000);
            // note still called only twice
            assert.ok(this.stub.calledTwice);
        });

    });
});

// vim: set et ts=4 sw=4 :
