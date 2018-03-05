'use strict'

const mh = require('multihashes')
const multibase = require('multibase')
const multicodec = require('multicodec')
const codecs = require('multicodec/src/base-table')
const codecVarints = require('multicodec/src/varint-table')
const multihash = require('multihashes')

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
class CID2 {
  /**
   * Create a new CID.
   *
   * The algorithm for argument input is roughly:
   * ```
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
   * ```
   *
   * @param {string|Buffer} version
   * @param {string} [codec]
   * @param {Buffer} [multihash]
   *
   * @example
   *
   * new CID(<version>, <codec>, <multihash>)
   * new CID(<cidStr>)
   * new CID(<cid.buffer>)
   * new CID(<multihash>)
   * new CID(<bs58 encoded multihash>)
   * new CID(<cid>)
   *
   */
  constructor (version, codec, multihash) {
    if (CID2.isCID(version)) {
      let cid = version
      this.version = cid.version
      this.codec = cid.codec
      this.multihash = Buffer.from(cid.multihash)
      return
    }
    if (typeof version === 'string') {
      if (multibase.isEncoded(version)) { // CID String (encoded with multibase)
        const cid = multibase.decode(version)
        version = parseInt(cid.slice(0, 1).toString('hex'), 16)
        codec = multicodec.getCodec(cid.slice(1))
        multihash = multicodec.rmPrefix(cid.slice(1))
      } else { // bs58 string encoded multihash
        codec = 'dag-pb'
        multihash = mh.fromB58String(version)
        version = 0
      }
    } else if (Buffer.isBuffer(version)) {
      const firstByte = version.slice(0, 1)
      const v = parseInt(firstByte.toString('hex'), 16)
      if (v === 0 || v === 1) { // CID
        const cid = version
        version = v
        codec = multicodec.getCodec(cid.slice(1))
        multihash = multicodec.rmPrefix(cid.slice(1))
      } else { // multihash
        codec = 'dag-pb'
        multihash = version
        version = 0
      }
    }

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

    CID2.validateCID(this)
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
          Buffer.from('01', 'hex'),
          Buffer.from(codecVarints[this.codec]),
          this.multihash
        ])
      default:
        throw new Error('unsupported version')
    }
  }

  /**
   * Get the prefix of the CID.
   *
   * @returns {Buffer}
   * @readonly
   */
  get prefix () {
    return Buffer.concat([
      Buffer.from(`0${this.version}`, 'hex'),
      codecVarints[this.codec],
      multihash.prefix(this.multihash)
    ])
  }

  /**
   * Convert to a CID of version `0`.
   *
   * @returns {CID2}
   */
  toV0 () {
    if (this.codec !== 'dag-pb') {
      throw new Error('Cannot convert a non dag-pb CID to CIDv0')
    }

    return new CID2(0, this.codec, this.multihash)
  }

  /**
   * Convert to a CID of version `1`.
   *
   * @returns {CID2}
   */
  toV1 () {
    return new CID2(1, this.codec, this.multihash)
  }

  /**
   * Encode the CID into a string.
   *
   * @param {string} [base='base58btc'] - Base encoding to use.
   * @returns {string}
   */
  toBaseEncodedString (base) {
    base = base || 'base58btc'

    switch (this.version) {
      case 0: {
        if (base !== 'base58btc') {
          throw new Error('not supported with CIDv0, to support different bases, please migrate the instance do CIDv1, you can do that through cid.toV1()')
        }
        return mh.toB58String(this.multihash)
      }
      case 1:
        return multibase.encode(base, this.buffer).toString()
      default:
        throw new Error('Unsupported version')
    }
  }

  /**
   * Serialize to a plain object.
   *
   * @returns {SerializedCID}
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
   * @param {CID2} other
   * @returns {bool}
   */
  equals (other) {
    return this.codec === other.codec &&
      this.version === other.version &&
      this.multihash.equals(other.multihash)
  }

  /**
   * Test if the given input is a CID.
   *
   * @param {any} other
   * @returns {bool}
   */
  static isCID (other) {
    try {
      let errorMsg = CID2._checkCIDComponents(other)
      return !(errorMsg)
    } catch (err) {
      return false
    }
  }

  /**
   * Test if the given input is a valid CID object.
   * Throws if it is not.
   *
   * @param {any} other
   * @returns {void}
   */
  static validateCID (other) {
    let errorMsg = CID2._checkCIDComponents(other)
    if (errorMsg) {
      throw new Error(errorMsg)
    }
  }

  /**
   * Test if the given input is a valid CID object.
   * Returns an error message if it is not, or
   * Throws an error its multihash is invalid.
   *
   * @param {any} other
   * @returns {string}
   */
  static _checkCIDComponents (other) {
    if (other == null) {
      return 'null values are not valid CIDs'
    }

    if (!(other.version === 0 || other.version === 1)) {
      return 'Invalid version, must be a number equal to 1 or 0'
    }

    if (typeof other.codec !== 'string') {
      return 'codec must be string'
    }

    if (!Buffer.isBuffer(other.multihash)) {
      return 'multihash must be a Buffer'
    }

    mh.validate(other.multihash)
    return null
  }
}

CID2.codecs = codecs

module.exports = CID2
