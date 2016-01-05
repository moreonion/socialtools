/* global require describe it */

var assert = require('assert');
var Progressbar = require('../src/progressbar/progressbar');

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
});

// vim: set et ts=4 sw=4 :
