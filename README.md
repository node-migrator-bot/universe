**Universe** is a library used to declare some project directory structure. [![Build Status](https://secure.travis-ci.org/AngryBytes/universe.png)](http://travis-ci.org/AngryBytes/universe)

At the heart of universe is the project root:

    var universe = require('universe');
    console.log(universe.root);

The project root is assumed to be one directory up from the current process's
executable (`require.main`). Another way of seeing it is that universe expects
your executables to live in e.g. the `bin/` or `libexec/` directories in your
project.

On the Node REPL, universe will simply use the current working directory.
(`process.cwd()`)

Universe provides easy access to subdirectories:

    var fs = require('fs');
    var path = require('path');

    var configFile = path.resolve(universe.config, 'database.json');
    var config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

By default, universe defines `bin`, `lib`, `config`, `log` and `tmp`. These
directories are created once the properties are accessed. To define additional
directories:

    universe.addDirectory('libexec');

    // Or a bunch in one shot.
    universe.addDirectories(['libexec', 'data']);

    // Or with an explicit path.
    universe.addDirectory('sysTmp', '/tmp');

    // Also possible in a batch.
    universe.addDirectories({
        libexec: 'libexec',
        data: 'data',
        sysTmp: '/tmp'
    });

## Configuration

Universe has a few configurables. Any configuration should happen at the
earliest possible opportunity. Once a property such as `root` or `bin` is used
by the application, it doesn't make much sense to reconfigure universe. And
typical usage assumes these properties to be **always** available.

For example, some special scenarios require a process to override the default
root directory. This would look as follows:

    #!/usr/bin/env node

    var path = require('path');

    // In this example, the executable is two levels deep. (bin/foo/bar.js)
    // (Note that path.resolve also needs a '..' for the filename itself.)
    var universe = require('universe');
    universe.defaultRoot = path.resolve(require.main.filename, '../../../');

    // Do so before even requiring other libraries.
    var someLibrary = require('someLibrary');

Users may override the root or any of the directories using environment
variables, e.g. `UNIVERSE_ROOT`, `UNIVERSE_LOG`, etc. The application may
request a different variable name prefix:

    universe.envPrefix = 'MYPROJECT';
    // universe will look for 'MYPROJECT_ROOT', 'MYPROJECT_LOG', etc.

All properties may also be directly assigned. Especially for `root`, however,
this is not recommended, because it will override a user's environment
variables. Use `defaultRoot` instead.
