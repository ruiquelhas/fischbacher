# fischbacher
Server-level [lafayette](https://github.com/ruiquelhas/lafayette) validation for [hapi](https://github.com/hapijs/hapi).

[![NPM Version][fury-img]][fury-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url]

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [Example](#example)
- [Supported File Types](#supported-file-types)

## Installation
Install via [NPM](https://www.npmjs.org).

```sh
$ npm install fischbacher
```

## Usage
Register the package as a server plugin to enable validation for each route that parses — `parse: true` — and creates a temporary file copy of the request payload — `output: 'file'`. For every other route with a different configuration, the validation is skipped.

If the validation fails, a [joi](https://github.com/hapijs/joi)-like `400 Bad Request` error is returned alongside an additional `content-validation: failure` response header. If everything is ok, the response will ultimately contain a `content-validation: success` header.

### Example

```js
const Hapi = require('hapi');
const Fischbacher = require('fischbacher');

const server = new Hapi.Server();
server.connection({
    // go nuts
});

const plugin = {
    register: Fischbacher,
    options: {
        // Allow png files only
        whitelist: ['image/png']
    }
};

server.register(plugin, (err) => {

    server.route({
        config: {
            payload: {
                output: 'file',
                parse: true
            }
            // go nuts
        }
    });

    server.start(() => {
        // go nuts
    });
});
```

## Supported File Types
The same as [file-type](https://github.com/sindresorhus/file-type#supported-file-types).

[coveralls-img]: https://coveralls.io/repos/ruiquelhas/fischbacher/badge.svg
[coveralls-url]: https://coveralls.io/github/ruiquelhas/fischbacher
[david-img]: https://david-dm.org/ruiquelhas/fischbacher.svg
[david-url]: https://david-dm.org/ruiquelhas/fischbacher
[fury-img]: https://badge.fury.io/js/fischbacher.svg
[fury-url]: https://badge.fury.io/js/fischbacher
[travis-img]: https://travis-ci.org/ruiquelhas/fischbacher.svg
[travis-url]: https://travis-ci.org/ruiquelhas/fischbacher
