'use strict'

const mh = require('multihashes')
const multibase = require('multibase')

const codecs = require('./codecs')

class CID {
  constructor (codec, version, hash) {
    if (typeof codec === 'string') {
      codec = mh.fromB58String(codec)
    }

    if (Buffer.isBuffer(codec)) {
      this.codec = codecs.protobuf
      this.version = 0
      this.hash = codec
    } else if (typeof codec === 'object') {
      this.codec = codec.codec
      this.version = codec.version
      this.hash = codec.hash
    } else {
      this.codec = codec
      this.version = version
      this.hash = hash
    }
  }

  get buffer () {
    switch (this.version) {
      case 0:
        return this.hash
      case 1:
        return Buffer.concat([
          Buffer(this.version),
          Buffer(this.codec),
          this.hash
        ])
      default:
        throw new Error('unsupported version')
    }
  }

  toString () {
    switch (this.version) {
      case 0:
        return mh.toB58String(this.hash)
      case 1:
        return multibase.encode('base58btc', this.buffer).toString()
      default:
        throw new Error('Unsupported version')
    }
  }

  toJSON () {
    return {
      codec: this.codec,
      version: this.version,
      hash: this.hash
    }
  }

  equals (other) {
    return this.codec === other.codec &&
      this.version === other.version &&
      this.hash.equals(other.hash)
  }
}

CID.codecs = codecs
CID.isCID = (other) => {
  return other.constructor.name === 'CID'
}

module.exports = CID
