var test = require('tap').test;

test('only one version per node process', function(t) {
  process._universe = { version: -1 };
  t.throws(function() { require('../'); }, {
      name: 'Error',
      message: 'Incompatible versions of universe are loaded'
  }, 'incompatible versions should be rejected');
  t.end();
});
