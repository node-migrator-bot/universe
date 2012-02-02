var fs = require('fs');
var test = require('tap').test;
var rimraf = require('rimraf');
var universe = require('../');

testDir = '/tmp/universe-test-directories';
testTmpDir = testDir + '/tmp'

test('universe should ensure subdirectories', function(t) {
    fs.mkdirSync(testDir, 0700);
    universe.root = testDir;

    t.equal(testTmpDir, universe.tmp, 'tmp dir should be underneath root');
    t.doesNotThrow(function() {
        fs.statSync(testTmpDir);
    }, 'tmp dir should exist');

    rimraf(testDir, function(err) {
        if (err) throw err;
        t.end();
    });
});
