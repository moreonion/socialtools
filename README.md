# Socialtools.js

The `Socialtools` provide means to display realtime social proof widgets,
generated client-side in the browser.

They

* poll HTTP endpoints for social proof data;
* are highly configurable and designed genericly, i.e. without specfic
  platforms (Data APIs, CMSs, ...) in mind;
* are designed modular.

## TODO

Lot's of...

## Usage

The file(s) you will need depend on your use case.

### with Browerserify

If you want to simply include all the Socialtools in a modern browser, use the
browserified version of the Socialtools:
[`dist/socialtools-full-modern.js`](./dist/socialtools-full-modern.js) (or the
minified version
[`dist/socialtools-full-modern.min.js`](./dist/socialtools-full-modern.min.js))

For older browsers you might need the version with polyfills:
[`dist/socialtools-full-legacy.js`](./dist/socialtools-full-legacy.js) (or the
minified version
[`dist/socialtools-full-legacy.min.js`](./dist/socialtools-full-legacy.min.js))

You can access the Socialtools in your JavaScript as `window.Socialtools`.

For an example see
[`examples/browserify/example.html`](./examples/browserify/example.html).

### with RequireJS

If you are using RequireJS, you can use the files in the
[`build/umd/`](./build/umd) directory. They build from the [`src`](./src) tree
to include an UMD header.

For an example see
[`examples/requirejs/example.html`](./examples/requirejs/example.html).

## Components

The Socialtools currently consist of the following modules:

* Poller: to poll social proof data from URLs
* Progress: for display a progressbar or thermometer widget
* util: utility functions

## Configuration

See https://moreonion.github.io/socialtools/doc
for the possible configuration options.

## Examples

See [`examples/`](./examples).

## Documentation

See https://moreonion.github.com/socialtools/doc

The documentation is provided in-code via JSDoc. To compile the documentation
run `npm run doc`.
The documentation will then be written into the directory `doc/`.

## Browser Compatibility

Supported are modern browsers with ES5 support, i.e. IE9+, Firefox, Chrome,
Edge, Chrome Mobile, Android Browser, Safari.

You will need Polyfills for some of these.

## Testing

Their is a testing environment configured and tests are provided. Test, a test
runner (Mocha) and a coverage tool (Istanbul) are configured.

Run `npm test` and see if they pass. The coverage information will be written
into the directory `coverage/`.

## License

Socialtools is licensed under the GPL version 3.0.

## Changelog

* 0.0.2
* 0.0.1 "nothing to see"
