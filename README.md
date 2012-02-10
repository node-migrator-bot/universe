**Universe** is a library used to declare some project directory structure. [![Build Status](https://secure.travis-ci.org/Two-Screen/universe.png)](http://travis-ci.org/Two-Screen/universe)

Universe makes it possible for modules that are dependencies of a project 
(possibly indirect or deep) to still be able to find project directories.

## Usage

Each directory universe knows about is a property on the universe module. For
example, to get the path to the project root:

    var universe = require('universe');
    console.log(universe.root);

In addition to the root directory, universe also defines properties for the
`bin`, `lib`, `config`, `log` and `tmp` directories by default:

    // Suppose that: universe.root == '/home/john/myapp'
    console.log(universe.bin);  # => '/home/john/myapp/bin'

Universe will attempt to create directories that don't exist when the property
is accessed. (Except for the `root`.)

Each of these properties has a companion function named `rootPath`, `binPath`,
etc. These are `path.join` helpers:

    universe.logPath('access.log');  # => '/home/john/myapp/log/access.log'

## Configuration

Universe determines the path to a directory in three steps:

 - Look for an environment variable, which the user may have set to override
   a directory path, e.g. `UNIVERSE_ROOT`, `UNIVERSE_BIN`, etc.

 - Look for an application override, which the application may have set using
   the companion property, e.g. `defaultRoot`, `defaultBin`, etc.

 - By default create a path underneath the root, e.g. `root/bin`, `root/log`.

The default for the project root itself is determined as follows:

 - If this is a REPL, use the current directory. (ie.: `process.cwd()`)

 - Otherwise, take the directory above `require.main`. The assumption is that
   executables all live in the projects `bin`, or another subdirectory.

### Rule of thumb

In general, when doing any configuration of universe, it should be done as
early as possible in the process. Universe properties should be treated more
or less as constant, much like say `NODE_PATH`.

The rationale is that no code should have to concern itself with directory
paths suddenly shifting.

In fact, universe enforces this by setting each property to read-only on first
access.

### Setting default paths

In particular, an executable may wish to set `defaultRoot` if it is in an
unusual location. For example, within `Jakefile` or `Cakefile`, you'll notice
that `require.main` is actually the `jake` or `cake` executable. This can be
solved as follows:

    var universe = require('universe');
    universe.defaultRoot = process.cwd();

The `default*` properties are also available for other directories, e.g.
`defaultTmp`.

While it is also possible to directly assign `universe.root`, `universe.tmp`,
etc., this is not recommended. It'll deprive the user from using environment
variables to override the directories.

### Custom environment prefix

A framework may want to set a different environment variable prefix. To
achieve something like `FLAVOUR_ROOT`, for example, you'd do:

    universe.envPrefix = 'FLAVOUR';

## Defining new directories

Registering new directories is easy, and automatically creates the companion
properties on the universe module:

    universe.addDirectory('libexec');
    universe.addDirectories(['libexec', 'data']);

Directory names (or even paths) can be specified as well. When no override is
specified, universe will use these as the default, and lazily `path.resolve`
them with the root.

    universe.addDirectory('sysTmp', '/tmp');
    universe.addDirectories({
        libexec: 'libexec',
        db: 'data/db',
        sysTmp: '/tmp'
    });

Finally, there's a umask parameter, which defaults to `0777`.

    // These two calls are the same.
    universe.addDirectory('libexec');
    universe.addDirectory('libexec', 'libexec', 0777);
