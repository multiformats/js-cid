# js-cid

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-cid/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-cid?branch=master)
[![Travis CI](https://travis-ci.org/ipfs/js-cid.svg?branch=master)](https://travis-ci.org/ipfs/js-cid)
[![Circle CI](https://circleci.com/gh/ipfs/js-cid.svg?style=svg)](https://circleci.com/gh/ipfs/js-cid)
[![Dependency Status](https://david-dm.org/ipfs/js-cid.svg?style=flat-square)](https://david-dm.org/ipfs/js-cid)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> CID implementation in JavaScript.

## Table of Contents

- [Install](#install)
  - [In Node.js through npm](#in-nodejs-through-npm)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [In the Browser through `<script>` tag](#in-the-browser-through-script-tag)
    - [Gotchas](#gotchas)
- [Usage](#usage)
- [API](#api)
  - [`new CID(codec[, version, hash])`](#new-cidcodec-version-hash)
  - [`.codec`](#codec)
  - [`.version`](#version)
  - [`.hash`](#hash)
  - [`.buffer`](#buffer)
  - [`.toString()`](#tostring)
  - [`.toJSON()`](#tojson)
  - [`CID.isCID(other)`](#cidiscidother)
  - [`CID.codecs`](#cidcodecs)
- [Contribute](#contribute)
- [License](#license)

## Install

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

### Constructor

- `new CID(<version>, <codec>, <multihash>)`
- `new CID(<cidStr>)`
- `new CID(<cid.buffer>)`
- `new CID(<multihash>)`
- `new CID(<bs58 encoded multihash>)`

### `.codec`

### `.version`

### `.hash`

### `.buffer`

### `.toV0()`

### `.toV1()`

### `.toBaseEncodedString(base)`

Defaults to 'base58btc'

### `.toJSON()`

### `CID.isCID(other)`

### `CID.codecs`

## Contribute

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

Contributions welcome. Please check out [the issues](https://github.com/ipfs/js-cid/issues).

Check out our [contributing document](https://github.com/ipfs/community/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT
