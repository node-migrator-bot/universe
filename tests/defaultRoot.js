var test = require('tap').test;
var universe = require('../');

testDir = '/tmp/universe-test-defaultRoot';
testBinDir = testDir + '/bin'

test('default root dir is derived from bin', function(t) {
    oldMain = require.main.filename
    require.main.filename = testBinDir + '/foo.js';
    t.equal(testDir, universe.defaultRoot, 'default root should be test dir');
    require.main.filename = oldMain

    t.end();
});
