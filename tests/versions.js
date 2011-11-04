var test = require('tap').test;

test('only one version per node process', function(t) {
  process._universe = {};
  t.throws(function() { require('../'); });
  t.end();
});
