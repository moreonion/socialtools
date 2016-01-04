/* global require describe it*/

var assert = require('assert');
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
});

