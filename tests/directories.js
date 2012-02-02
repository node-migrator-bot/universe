var fs = require('fs');
var test = require('tap').test;
var rimraf = require('rimraf');
var universe = require('../');

testDir = '/tmp/universe-test-directories';
testTmpDir = testDir + '/tmp'

test('directory utilities', function(t) {
    fs.mkdirSync(testDir, 0700);
    universe.root = testDir;

    t.equal(universe.rootPath('foo', 'bar/baz'), testDir + '/foo/bar/baz',
        'rootPath should return a path.join()ed subpath');

    t.equal(testTmpDir, universe.tmp, 'tmp dir should be underneath root');
    t.doesNotThrow(function() {
        fs.statSync(testTmpDir);
    }, 'tmp dir should exist');

    t.equal(universe.tmpPath('foobar'), testTmpDir + '/foobar',
        'tmpPath should return a path.join()ed subpath');

    rimraf(testDir, function(err) {
        if (err) throw err;
        t.end();
    });
});
