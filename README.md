# js-cid

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-cid/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-cid?branch=master)
[![Travis CI](https://travis-ci.org/ipfs/js-cid.svg?branch=master)](https://travis-ci.org/ipfs/js-cid)
[![Circle CI](https://circleci.com/gh/ipfs/js-cid.svg?style=svg)](https://circleci.com/gh/ipfs/js-cid)
[![Dependency Status](https://david-dm.org/ipfs/js-cid.svg?style=flat-square)](https://david-dm.org/ipfs/js-cid)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> CID implementation in JavaScript.

## Installation

### In Node.js through npm

```bash
$ npm install --save cids
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```js
const CID = require('cids')
```

### In the Browser through `<script>` tag

Loading this module through a script tag will make the ```multihash``` obj available in the global namespace.

```
<script src="https://unpkg.com/cids/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/cids/dist/index.js"></script>
```

#### Gotchas

You will need to use Node.js `Buffer` API compatible, if you are running inside the browser, you can access it by `multihash.Buffer` or you can install Feross's [Buffer](https://github.com/feross/buffer).

## Usage

```js
const CID = require('cids')

// V1 CID
const cid = new CID(CID.codecs.raw, 1, myhash)

// V0 CID
const cid = new CID(base58Multihash)
```

## API

### `new CID(codec[, version, hash])`

### `.codec`

### `.version`

### `.hash`

### `.buffer`

### `.toString()`

### `.toJSON()`

### `CID.isCID(other)`

### `CID.codecs`

## License

MIT
