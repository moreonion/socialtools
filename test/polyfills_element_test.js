/* global require describe it before after */

var chai = require('chai');
var assert = chai.assert;
var polyfill = require('../build/polyfills/element/remove');

var jsdom = require('jsdom-global');

describe('polyfills', function () {
    describe('Element', function () {
        describe('remove()', function () {
            before(function () {
                this.jsdom = jsdom();
            });

            after(function () {
                this.jsdom(); // cleanup
            });

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
