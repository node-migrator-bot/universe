// Get and export our version number.
exports.version = require('./package.json').version;

// Check for another instance of universe.
if (process._universe) {
    if (process._universe.version !== exports.version)
        throw new Error("Mismatching versions of universe are loaded");
    module.exports = process._universe;
    return;
}
else {
    // Claim our rightful spot!
    process._universe = exports;
}


var fs   = require('fs');
var path = require('path');


// Pretty much everything we export is a lazy property that becomes
// fixed (unwritable) once accessed. This helper wraps that pattern.
function exportFixedProp(name, getDefault, didFix) {
    Object.defineProperty(exports, name, {
        configurable: true,
        get: function() {
            return exports[name] = getDefault();
        },
        set: function(value) {
            Object.defineProperty(exports, name, {
                value: value,
                writable: false,
                configurable: false
            });
            if (didFix)
                didFix(value);
        }
    });
}


// The prefix used for environment variables that override paths.
exportFixedProp('envPrefix', function() {
    return 'UNIVERSE';
});


// The default root directory. When specifying a root from code, it's
// recommended to set this (rather than `root`), to allow a user to still
// override it using the environment.
exportFixedProp('defaultRoot', function() {
    if (require.main)
        return path.resolve(require.main.filename, '..', '..');
    else
        return process.cwd();
});


// The project root directory. Use this (rather than `defaultRoot`) to
// actually resolve paths in the project.
exportFixedProp('root', function() {
    var envDirectory = process.env[exports.envPrefix + "_ROOT"];
    if (envDirectory)
        return envDirectory;
    else
        return exports.defaultRoot;
});


// Add a directory property. Universe ensures the directory exists once the
// property is accessed. The `directory` and `umask` parameters are optional.
var addDir = exports.addDirectory = function(varName, directory, umask) {
    if (typeof(directory) !== 'string')
        directory = varName;
    if (typeof(umask) !== 'number')
        umask = 0777;

    var getDefault = function() {
        var envName = exports.envPrefix + "_" + varName.toUpperCase();
        var envDirectory = process.env[envName];

        if (envDirectory)
            return envDirectory;
        else
            return path.resolve(exports.root, directory);
    };

    var didFix = function(value) {
        try {
            fs.mkdirSync(value, umask);
        }
        catch (e) {
            if (e.code !== 'EEXIST')
                throw e;
        }
    };

    exportFixedProp(varName, getDefault, didFix);
};

// Variant for adding a list or map of multiple directories in one shot.
var addDirs = exports.addDirectories = function(list_or_map) {
    if (list_or_map.length !== undefined) {
        list_or_map.forEach(addDir);
    }
    else {
        for (var varName in list_or_map) {
            var directory = list_or_map[varName];
            addDir(varName, directory);
        }
    }
};


// A number of standard subdirectories.
addDirs(['bin', 'lib', 'config', 'log', 'tmp']);
