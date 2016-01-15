/* global require describe it beforeEach global */

var chai = require('chai');
var assert = chai.assert;
var utils = require('../src/common/utils');

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
});

// vim: set et ts=4 sw=4 :
