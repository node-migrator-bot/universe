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
var exportFixedProp = function(name, getDefault, didFix) {
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


// Internal helper that defines the common stuff between the root directory
// and subdirectory properties.
var addDirInternal = function(propName, umask, getDefault, fixed) {
    // Define the property that allows the application to override the default
    // path to a subdirectory.
    var defaultName = "default" +
        propName.charAt(0).toUpperCase() + propName.slice(1);
    exportFixedProp(defaultName, getDefault);

    // Define the directory property itself.
    var getter = function() {
        // Accept an override from the environment.
        var envName = exports.envPrefix + "_" + propName.toUpperCase();
        var envDirectory = process.env[envName];
        if (envDirectory)
            return path.resolve(envDirectory);
        // Otherwise, use the application default
        // from the property defined above.
        else
            return exports[defaultName];
    };
    exportFixedProp(propName, getter, fixed);

    // Define a `path.join` wrapper.
    exports[propName + "Path"] = function() {
        var args = Array.prototype.slice.apply(arguments);
        return path.join.apply(path, [exports[propName]].concat(args));
    };
}


// The root directory. There's no fixed callback, we expect the user to
// always ensure the root directory exists.
addDirInternal('root', 0777, function() {
    // By default, look for the root relative to the executable.
    if (require.main)
        return path.resolve(require.main.filename, '..', '..');
    // Or use the current directory when used from the REPL.
    else
        return process.cwd();
});

// Register a directory and properties.
var addDir = exports.addDirectory = function(propName, directory, umask) {
    if (typeof(directory) !== 'string')
        directory = propName;
    if (typeof(umask) !== 'number')
        umask = 0777;

    // By default, resolve relative to the root.
    var getDefault = function() {
        return path.resolve(exports.root, directory);
    };

    // Once the property becomes fixed, ensure the directory exists.
    var fixed = function(value) {
        var pre = exports.root + "/";
        if (value.slice(0, pre.length) !== pre)
            return;

        var parts = value.slice(pre.length).split('/');
        var i = exports.root;
        parts.forEach(function(part) {
            i += "/" + part;
            try {
                fs.mkdirSync(i, umask);
            }
            catch (e) {
                if (e.code !== 'EEXIST')
                    throw e;
            }
        });
    };

    addDirInternal(propName, umask, getDefault, fixed);
};

// Variant for adding a list or map of multiple directories in one shot.
var addDirs = exports.addDirectories = function(list_or_map) {
    if (list_or_map.length !== undefined) {
        list_or_map.forEach(addDir);
    }
    else {
        for (var propName in list_or_map) {
            var directory = list_or_map[propName];
            addDir(propName, directory);
        }
    }
};


// A number of standard subdirectories.
addDirs(['bin', 'lib', 'config', 'log', 'tmp']);
