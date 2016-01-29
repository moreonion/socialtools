/* global require describe it beforeEach afterEach */

var chai = require('chai');
var assert = chai.assert;
var polyfill = require('../src/polyfills/object/assign');

describe('polyfills', function () {
    describe('Object', function () {
        beforeEach(function () {
            this.origAssign = Object['assign'];
            delete Object['assign'];
        });

        afterEach(function () {
            delete Object['assign'];
            Object['assign'] = this.origAssign;
        });

        describe('assign()', function () {
            it('should polyfill with a assign() method', function () {
                assert.ok(typeof Object.assign === 'undefined');
                polyfill.polyfill();
                assert.ok(typeof Object.assign === 'function');
            });

            it('should assign new source items into target object', function () {
                polyfill.polyfill();

                var target = {};
                var source = { test: 'test' };
                Object.assign(target, source);
                assert.equal('test', target['test']);
            });

            it('should assign from multiple source objects', function () {
                polyfill.polyfill();

                var target = {};
                var source1 = { test: 'test' };
                var source2 = { another: 'another test' };
                Object.assign(target, source1, source2);
                assert.equal('test', target['test']);
                assert.equal('another test', target['another']);
            });

            it('should update items in target with values from source object', function () {
                polyfill.polyfill();

                var target = { test: 'test' };
                var source = { test: 'different' };
                assert.equal('test', target['test']);
                Object.assign(target, source);
                assert.equal('different', target['test']);
            });

            it('does no deep merge', function () {
                polyfill.polyfill();

                var target = { test: {
                    shadowed: 'original',
                    deep: 'original'

                }};
                var source = { test: {
                    shadowed: 'new'
                }};
                assert.equal('original', target['test']['shadowed']);
                assert.equal('original', target['test']['deep']);
                Object.assign(target, source);
                assert.equal('new', target['test']['shadowed']);
                assert.ok(typeof target['test']['deep'] === 'undefined');
            });
        });
    });
});

// vim: set et ts=4 sw=4 :
