var fs = require('fs');
var path = require('path');
var test = require('tap').test;
var rimraf = require('rimraf');
var universe = require('../');

testDir = '/tmp/universe-test-custom';
testVarDir = testDir + '/var';
testDbDir = testDir + '/data/db';

test('custom directories', function(t) {
    fs.mkdirSync(testDir, 0700);
    universe.root = testDir;

    universe.addDirectory('var');
    t.equal(universe.var, testVarDir,
        'custom var dir should be underneath root');
    t.ok(fs.existsSync(universe.var),
        'custom var dir should exist after access');

    universe.addDirectories({ 'db': 'data/db' });
    t.equal(universe.db, testDbDir,
        'custom db dir should be two levels underneath root');
    t.ok(fs.existsSync(universe.db),
        'custom db dir should exist after access');

    rimraf(testDir, function(err) {
        if (err) throw err;
        t.end();
    });
});
