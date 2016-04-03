# acid-plugin-static

`acid-plugin-static` is a simple plugin for the [Acid static site generator](https://github.com/drewschrauf/ameeno-acid) to create a static site from a folder of Marko templates. A structure like this:

    index.marko
    about.marko
    contact/index.marko

will produce output like this:

    index.html
    about.html
    contact/index.html

## Usage

Add `acid-plugin-static` to your `acid.config.js` and include a directory path.

    var pluginStatic = require('acid-plugin-static');

    module.exports = {
        plugins: [
            pluginStatic({
                templateDir: './src/templates/flats',
                generateListing: true
            })
        ]
    };


## Options

`acid-plugin-static` accepts the following options.

- `templateDir` (string, required) - Path containing the templates
- `generateListing` (boolean, optional) - If no index.marko is provided, generate a simple list of routes to serve as the index. This is useful when using this package to produce static templates that will later be integrated into another system.
