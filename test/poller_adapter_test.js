/* global require describe it */

var chai = require('chai');
var assert = chai.assert;
var DefaultAdapterFn = require('../src/poller/adapter/default');
var NullAdapterFn = require('../src/poller/adapter/null');

describe('DefaultAdapterFn', function () {
    describe('calling', function () {
        it('returns the identical object it receives', function () {
            var responseJSON = { something: 'nothing' };
            var responseText = 'Only a string';
            assert.equal(responseText, DefaultAdapterFn(responseText)); // eslint-disable-line new-cap
            assert.equal(responseJSON, DefaultAdapterFn(responseJSON)); // eslint-disable-line new-cap
        });
    });
});

describe('NullAdapterFn', function () {
    describe('calling', function () {
        it('always returns null', function () {
            var responseJSON = { something: 'nothing' };
            var responseText = 'Only a string';
            assert.equal(null, NullAdapterFn(responseText)); // eslint-disable-line new-cap
            assert.equal(null, NullAdapterFn(responseJSON)); // eslint-disable-line new-cap
        });
    });
});

// vim: set et ts=4 sw=4 :
