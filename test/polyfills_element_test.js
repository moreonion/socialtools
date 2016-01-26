/* global require describe it beforeEach global */

var chai = require('chai');
var assert = chai.assert;
var polyfill = require('../src/polyfills/element/remove');

var jsdom = require('mocha-jsdom');

describe('polyfills', function () {
    describe('Element', function () {
        jsdom();

        describe('remove()', function () {
            it('should polyfill with a remove() method', function () {
                assert.ok(typeof window.Element.prototype.remove === 'undefined');
                polyfill.polyfill();
                assert.ok(typeof window.Element.prototype.remove === 'function');
            });

            it('should remove elements from a DOM', function () {
                polyfill.polyfill();

                var parent = document.createElement('div');
                var child = document.createElement('p');
                var fragment = document.createDocumentFragment();

                parent.appendChild(child);
                fragment.appendChild(parent);
                assert.equal(1, parent.childNodes.length);
                child.remove();
                assert.equal(0, parent.childNodes.length);
            });
        });
    });
});

// vim: set et ts=4 sw=4 :
