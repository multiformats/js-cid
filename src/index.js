'use strict'

const mh = require('multihashes')
const multibase = require('multibase')
const multicodec = require('multicodec')

const codecs = require('./codecs')

/**
 * @typedef {Object} SerializedCID
 * @param {string} codec
 * @param {number} version
 * @param {Buffer} multihash
 *
 */

/**
 * Class representing a CID `<mbase><version><mcodec><mhash>`
 * , as defined in [ipld/cid](https://github.com/ipld/cid).
 * @class CID
 */
class CID {
  /**
   * Construct a CID.
   *
   * Rough algorithm of construction:
   * if (str)
   *   if (1st char is on multibase table) -> CID String
   *   else -> bs58 encoded multihash
   * else if (Buffer)
   *   if (0 or 1) -> CID
   *   else -> multihash
   * else if (Number)
   *   -> construct CID by parts
   *
   * @param {string} version
   * @param {number} [codec]
   * @param {Buffer} [multihash]
   *
   * @example
   * const CID = require('cids')
   *
   * // V1 CID
   * const cid = new CID(CID.codecs.raw, 1, myhash)
   *
   * // V0 CID
   * const cid = new CID(base58Multihash)
   *
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

      /**
       * @type {string}
       */
      this.codec = codec

      /**
       * @type {number}
       */
      this.version = version

      /**
       * @type {Buffer}
       */
      this.multihash = multihash
    }
  }

  /**
   * The CID as a `Buffer`
   *
   * @return {Buffer}
   * @readonly
   *
   * @memberOf CID
   */
  get buffer () {
    switch (this.version) {
      case 0:
        return this.multihash
      case 1:
        return Buffer.concat([
          new Buffer('01', 'hex'),
          new Buffer(codecs[this.codec]),
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

  /**
   * Encode the CID into a string.
   *
   * @param {string} base - Mutlibase to use for encoding
   * @return {string}
   *
   * @memberOf CID
   */
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
  /**
   * Serialize to a plain object.
   *
   * @return {SerializedCID}
   *
   * @memberOf CID
   */
  toJSON () {
    return {
      codec: this.codec,
      version: this.version,
      hash: this.multihash
    }
  }

  /**
   * Compare equality with another CID.
   *
   * @param {CID} other
   * @return {boolean}
   *
   * @memberOf CID
   */
  equals (other) {
    return this.codec === other.codec &&
      this.version === other.version &&
      this.multihash.equals(other.multihash)
  }

  /**
   * Test if the given input is a valid CID object.
   *
   * @param {any} other
   * @return {boolean}
   *
   */
  static isCID (other) {
    return other.constructor.name === 'CID'
  }
}

/**
 * @type {Codecs}
 * @memberof CID
 * @static
 */
CID.codecs = codecs

module.exports = CID
