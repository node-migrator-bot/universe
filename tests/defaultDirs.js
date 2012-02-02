var test = require('tap').test;
var universe = require('../');

testDir = '/tmp/universe-test-defaultRoot';
testBinDir = testDir + '/bin';

test('default directories', function(t) {
    oldMain = require.main.filename;
    require.main.filename = testBinDir + '/foo.js';
    t.equal(testDir, universe.defaultRoot,
        'default root should be derived from executable path');
    require.main.filename = oldMain;

    t.equal(universe.root, universe.defaultRoot,
        'root should equal to default root');

    universe.defaultTmp = '/tmp';
    t.equal(universe.tmp, '/tmp',
        'tmp should equal default tmp after override');

    t.end();
});
