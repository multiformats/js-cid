'use strict'

const mh = require('multihashes')
const multibase = require('multibase')
const multicodec = require('multicodec')

const codecs = require('./codecs')

// CID: <mbase><version><mcodec><mhash>

class CID {
  /*
   * if (str)
   *   if (1st char is on multibase table) -> CID String
   *   else -> bs58 encoded multihash
   * else if (Buffer)
   *   if (0 or 1) -> CID
   *   else -> multihash
   * else if (Number)
   *   -> construct CID by parts
   *
   * ..if only JS had traits..
   */
  constructor (version, codec, multihash) {
    if (typeof version === 'string') {
      if (multibase.isEncoded(version)) { // CID String (encoded with multibase)
        const cid = multibase.decode(version)
        this.version = parseInt(cid.slice(0, 1).toString('hex'), 16)
        this.codec = multicodec.getCodec(cid.slice(1))
        this.multihash = multicodec.rmPrefix(cid.slice(1))
      } else { // bs58 string encoded multihash
        this.codec = 'dag-pb'
        this.multihash = mh.fromB58String(version)
        this.version = 0
      }
    } else if (Buffer.isBuffer(version)) {
      const firstByte = version.slice(0, 1)
      const v = parseInt(firstByte.toString('hex'), 16)
      if (v === 0 || v === 1) { // CID
        const cid = version
        this.version = v
        this.codec = multicodec.getCodec(cid.slice(1))
        this.multihash = multicodec.rmPrefix(cid.slice(1))
      } else { // multihash
        this.codec = 'dag-pb'
        this.multihash = version
        this.version = 0
      }
    } else if (typeof version === 'number') {
      if (typeof codec !== 'string') {
        throw new Error('codec must be string')
      }
      if (!(version === 0 || version === 1)) {
        throw new Error('version must be a number equal to 0 or 1')
      }
      mh.validate(multihash)
      this.codec = codec
      this.version = version
      this.multihash = multihash
    }
  }

  get buffer () {
    switch (this.version) {
      case 0:
        return this.multihash
      case 1:
        return Buffer.concat([
          Buffer('01', 'hex'),
          Buffer(codecs[this.codec]),
          this.multihash
        ])
      default:
        throw new Error('unsupported version')
    }
  }

  toV0 () {
    return this.multihash
  }

  toV1 () {
    return this.buffer
  }

  /* defaults to base58btc */
  toBaseEncodedString (base) {
    base = base || 'base58btc'

    switch (this.version) {
      case 0:
        return mh.toB58String(this.multihash)
      case 1:
        return multibase.encode(base, this.buffer).toString()
      default:
        throw new Error('Unsupported version')
    }
  }

  toJSON () {
    return {
      codec: this.codec,
      version: this.version,
      hash: this.multihash
    }
  }

  equals (other) {
    return this.codec === other.codec &&
      this.version === other.version &&
      this.multihash.equals(other.multihash)
  }
}

CID.codecs = codecs
CID.isCID = (other) => {
  return other.constructor.name === 'CID'
}

module.exports = CID
