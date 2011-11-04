var fs = require('fs');
var test = require('tap').test;
var rimraf = require('rimraf');
var universe = require('../');

testDir = '/tmp/universe-test-environment';
testTmpDir = testDir + '/tmp'

test('allow overrides from environment', function(t) {
    process.env['UNIVERSE_ROOT'] = testDir;
    t.equal(testDir, universe.root, 'root dir should match environment');

    fs.mkdir(testDir, 0700, function(err) {
        if (err && err.code !== 'EEXIST')
            t.error(err, 'create test suite working directory');

        universe.envPrefix = 'FOOBAR';
        process.env['FOOBAR_TMP'] = testTmpDir;
        t.equal(testTmpDir, universe.tmp, 'tmp dir should match environment');

        rimraf(testDir, function(err) {
            t.error(err, 'cleanup of test suite working directory');
            t.end();
        });
    });
});
