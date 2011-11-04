var fs = require('fs');
var test = require('tap').test;
var rimraf = require('rimraf');
var universe = require('../');

testDir = '/tmp/universe-test-directories';
testTmpDir = testDir + '/tmp'

test('universe should ensure subdirectories', function(t) {
    fs.mkdir(testDir, 0700, function(err) {
        if (err && err.code !== 'EEXIST')
            t.error(err, 'create test suite working directory');
        universe.root = testDir;

        t.equal(testTmpDir, universe.tmp, 'tmp dir should be underneath root');

        fs.stat(testTmpDir, function(err, stats) {
            t.error(err, 'tmp dir should exist');

            rimraf(testDir, function(err) {
                t.error(err, 'cleanup of test suite working directory');
                t.end();
            });
        });
    });
});
