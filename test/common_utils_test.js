/* global require describe it beforeEach global */

var chai = require('chai');
var assert = chai.assert;
var utils = require('../src/common/utils');

var jsdom = require('mocha-jsdom');

describe('utils', function () {
    describe('toInteger()', function () {
        it('should return the same integer when called with an integer', function () {
            assert.equal(10, utils.toInteger(10));
            assert.equal(12, utils.toInteger(12));
            assert.equal(-16, utils.toInteger(-16));
        });

        it('should return `0` when called with `NaN`', function () {
            assert.equal(0, utils.toInteger(NaN));
        });

        it('should return `0` when called with `Infinity`', function () {
            assert.equal(0, utils.toInteger(Infinity));
        });

        it('should return a number when called with an correct number string', function () {
            assert.equal(5, utils.toInteger('5'));
            assert.equal(-13, utils.toInteger('-13'));
        });

        it('should return `0` when called with an incorrect number string', function () {
            assert.equal(0, utils.toInteger('this is no number'));
        });

        it('should adher to the parseInt() parsing rules', function () {
            assert.equal(5, utils.toInteger('5number'));
            assert.equal(0, utils.toInteger('number5'));
        });

        it('can deal with a different number base', function () {
            assert.equal(58, utils.toInteger('3a', 16));
            assert.equal(58, utils.toInteger('3atztz', 16));
            assert.equal(0, utils.toInteger('number5', 16));
        });
    });

    describe('addQueryParams()', function () {
        jsdom();

        it('should return undefined when called without url', function () {
            assert.equal(undefined, utils.addQueryParams());
        });

        it('should return the same URL when called without params', function () {
            var url = 'https://sub.example.com';
            assert.equal(url, utils.addQueryParams(url));
            url = 'https://sub.example.com/';
            assert.equal(url, utils.addQueryParams(url));
            url = 'https://sub.example.com/?test=nothing';
            assert.equal(url, utils.addQueryParams(url));
        });

        it('should add one param', function () {
            var url = 'https://sub.example.com';
            assert.equal('https://sub.example.com/?one=example', utils.addQueryParams(url, {one: 'example'}));
        });

        it('should add more than one params in order', function () {
            var url = 'https://sub.example.com';
            assert.equal('https://sub.example.com/?one=example&two=something&three=else', utils.addQueryParams(url, {
                one: 'example',
                two: 'something',
                three: 'else'
            }));
        });

        it('should override existing params', function () {
            var url = 'https://sub.example.com/?one=something';
            assert.equal('https://sub.example.com/?one=else', utils.addQueryParams(url, {
                one: 'else'
            }));
        });

        it('should preserve fragment identifiers', function () {
            var url = 'https://sub.example.com/#fragment';
            assert.equal('https://sub.example.com/?one=example&two=something#fragment', utils.addQueryParams(url, {
                one: 'example',
                two: 'something'
            }));
        });
    });
});

// vim: set et ts=4 sw=4 :
