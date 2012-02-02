var test = require('tap').test;

test('only one version per node process', function(t) {
  process._universe = {};
  t.throws(function() { require('../'); }, {
      name: 'Error',
      message: 'Mismatching versions of universe are loaded'
  }, 'multiple versions should be rejected');
  t.end();
});
