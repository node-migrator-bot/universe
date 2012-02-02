var fs = require('fs');
var test = require('tap').test;
var rimraf = require('rimraf');
var universe = require('../');

testDir = '/tmp/universe-test-environment';
testTmpDir = testDir + '/tmp'

test('allow overrides from environment', function(t) {
    process.env['UNIVERSE_ROOT'] = testDir;
    t.equal(testDir, universe.root, 'root dir should match environment');

    fs.mkdirSync(testDir, 0700);

    universe.envPrefix = 'FOOBAR';
    process.env['FOOBAR_TMP'] = testTmpDir;
    t.equal(testTmpDir, universe.tmp, 'tmp dir should match environment');

    rimraf(testDir, function(err) {
        if (err) throw err;
        t.end();
    });
});
