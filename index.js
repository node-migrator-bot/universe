var fs   = require('fs');
var path = require('path');


exports.version = require('./package.json').version;
const CONFIG_VERSION = 1;


// Universe configuration applies process wide. Here, we try to find existing
// configuration. (And bail if the config version differs.)
var config;
if (config = process._universe) {
    if (config.version !== CONFIG_VERSION)
        throw new Error("Incompatible versions of universe are loaded");
}
else {
    config = process._universe = {
        version: CONFIG_VERSION,
        props: {}
    };
}


// Pretty much everything we export is a lazy property that becomes
// fixed (unwritable) once accessed. This helper wraps that pattern.
var exportFixedProp = function(name, getDefault, didFix) {
    Object.defineProperty(exports, name, {
        configurable: true,

        get: function() {
            // See if already set in another module instance.
            var value = config.props[name];
            if (!value)
                value = getDefault();

            // Call into the setter and return.
            return exports[name] = value;
        },

        set: function(value) {
            // See if already set in another module instance.
            if (config.props[name])
                value = config.props[name];
            else
                config.props[name] = value;

            // Redefine as read-only.
            Object.defineProperty(exports, name, {
                value: value,
                writable: false,
                configurable: false
            });

            // Callback.
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
