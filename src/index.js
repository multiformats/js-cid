// @flow strict

'use strict'

const mh = require('multihashes')
const multibase = require('multibase')
const multicodec = require('multicodec')
const codecs = require('multicodec/src/base-table')
const CIDUtil = require('./cid-util')
const withIs = require('class-is')

/*::
export type Version = 0 | 1
export type Codec = string
export type Multihash = Buffer
export type BaseEncodedString = string
export type MultibaseName = string
export type SerializedCID = {
  codec:Codec;
  version:Version;
  hash:Multihash;
}
*/

/**
 * @typedef {Object} SerializedCID
 * @param {string} codec
 * @param {number} version
 * @param {Buffer} hash
 */

/**
 * Test if the given input is a CID.
 * @function isCID
 * @memberof CID
 * @static
 * @param {any} other
 * @returns {bool}
 */

/**
 * Class representing a CID `<mbase><version><mcodec><mhash>`
 * , as defined in [ipld/cid](https://github.com/multiformats/cid).
 * @class CID
 */
class CID /*:: <a> */{
  /**
   * Create a new CID.
   *
   * The algorithm for argument input is roughly:
   * ```
   * if (cid)
   *   -> create a copy
   * else if (str)
   *   if (1st char is on multibase table) -> CID String
   *   else -> bs58 encoded multihash
   * else if (Buffer)
   *   if (1st byte is 0 or 1) -> CID
   *   else -> multihash
   * else if (Number)
   *   -> construct CID by parts
   * ```
   *
   * @param {string|Buffer} version
   * @param {string} [codec]
   * @param {Buffer} [multihash]
   * @param {string} [multibaseName]
   *
   * @example
   * new CID(<version>, <codec>, <multihash>, <multibaseName>)
   * new CID(<cidStr>)
   * new CID(<cid.buffer>)
   * new CID(<multihash>)
   * new CID(<bs58 encoded multihash>)
   * new CID(<cid>)
   */
  /*::
  +version:Version
  +codec:Codec
  +multihash:Multihash
  +multibaseName:MultibaseName
  string:?string
  _buffer:?Buffer
  static isCID:(mixed) => boolean
  */
  constructor (
    version/*: CID<a> | BaseEncodedString | Buffer | Version */,
    codec/*: ?Codec */ = undefined,
    multihash/*: ?Multihash */ = undefined,
    multibaseName/*: MultibaseName */ = 'base58btc'
  ) {
    const cid = CID.matchCID(version)
    if (cid) {
      this.version = cid.version
      this.codec = cid.codec
      this.multihash = Buffer.from(cid.multihash)
      this.multibaseName = cid.multibaseName
      return
    }

    if (typeof version === 'string') {
      // e.g. 'base32' or false
      const baseName = multibase.isEncoded(version)
      if (baseName) {
        // version is a CID String encoded with multibase, so v1
        const cid = multibase.decode(version)
        // Type checker will fail because parseInt isn't guaranteed to return
        // 0 or 1 it can be any int. Invariant is later enforced through
        // `validateCID` and we use any type to make type-checker trust us.
        const v/*: any */ = parseInt(cid.slice(0, 1).toString('hex'), 16)
        this.version = v
        this.codec = multicodec.getCodec(cid.slice(1))
        this.multihash = multicodec.rmPrefix(cid.slice(1))
        this.multibaseName = baseName
      } else {
        // version is a base58btc string multihash, so v0
        this.version = 0
        this.codec = 'dag-pb'
        this.multihash = mh.fromB58String(version)
        this.multibaseName = 'base58btc'
      }
      CID.validateCID(this)
      Object.defineProperty(this, 'string', { value: version })
      return
    }

    // type checker can refine type from predicate function like `isBuffer` but
    // it can on instanceof check, which is why we use inline comment to enable
    // that refinement.
    if (Buffer.isBuffer(version) /*:: && version instanceof Buffer */) {
      const firstByte = version.slice(0, 1)
      const v = parseInt(firstByte.toString('hex'), 16)
      if (v === 0 || v === 1) {
        // version is a CID buffer
        const cid = version
        this.version = v
        this.codec = multicodec.getCodec(cid.slice(1))
        this.multihash = multicodec.rmPrefix(cid.slice(1))
        this.multibaseName = (v === 0) ? 'base58btc' : multibaseName
      } else {
        // version is a raw multihash buffer, so v0
        this.version = 0
        this.codec = 'dag-pb'
        this.multihash = version
        this.multibaseName = 'base58btc'
      }
      CID.validateCID(this)
      return
    }

    // otherwise, assemble the CID from the parameters
    // type checker will not accept `version`, `codec`, `multihash` as is
    // because types don't correspond to [number, string, Buffer] so we
    // use any below as we know `CID.validateCID` will throw if types do not
    // match up.
    const [$version, $codec, $multihash]/*: any */ = [version, codec, multihash]

    /**
     * @type {number}
     */
    this.version = $version

    /**
     * @type {string}
     */
    this.codec = $codec

    /**
     * @type {Buffer}
     */
    this.multihash = $multihash

    /**
     * @type {string}
     */
    this.multibaseName = multibaseName

    CID.validateCID(this)
  }

  /**
   * The CID as a `Buffer`
   *
   * @return {Buffer}
   * @readonly
   *
   * @memberOf CID
   */
  get buffer ()/*: Buffer */ {
    let buffer = this._buffer

    if (!buffer) {
      if (this.version === 0) {
        buffer = this.multihash
      } else if (this.version === 1) {
        buffer = Buffer.concat([
          Buffer.from('01', 'hex'),
          multicodec.getCodeVarint(this.codec),
          this.multihash
        ])
      } else {
        throw new Error('unsupported version')
      }

      // Cache this buffer so it doesn't have to be recreated
      Object.defineProperty(this, '_buffer', { value: buffer })
    }

    return buffer
  }

  /**
   * Get the prefix of the CID.
   *
   * @returns {Buffer}
   * @readonly
   */
  get prefix ()/*: Buffer */ {
    return Buffer.concat([
      Buffer.from(`0${this.version}`, 'hex'),
      multicodec.getCodeVarint(this.codec),
      mh.prefix(this.multihash)
    ])
  }

  /**
   * Convert to a CID of version `0`.
   *
   * @returns {CID}
   */
  toV0 ()/*: CID<a> */ {
    if (this.codec !== 'dag-pb') {
      throw new Error('Cannot convert a non dag-pb CID to CIDv0')
    }

    const { name, length } = mh.decode(this.multihash)

    if (name !== 'sha2-256') {
      throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0')
    }

    if (length !== 32) {
      throw new Error('Cannot convert non 32 byte multihash CID to CIDv0')
    }

    return new _CID(0, this.codec, this.multihash)
  }

  /**
   * Convert to a CID of version `1`.
   *
   * @returns {CID}
   */
  toV1 ()/*: CID<a> */ {
    return new _CID(1, this.codec, this.multihash)
  }

  /**
   * Encode the CID into a string.
   *
   * @param {string} [base=this.multibaseName] - Base encoding to use.
   * @returns {string}
   */
  toBaseEncodedString (base/*: MultibaseName */ = this.multibaseName)/*: BaseEncodedString */ {
    if (this.string && base === this.multibaseName) {
      return this.string
    }
    let str = null
    if (this.version === 0) {
      if (base !== 'base58btc') {
        throw new Error('not supported with CIDv0, to support different bases, please migrate the instance do CIDv1, you can do that through cid.toV1()')
      }
      str = mh.toB58String(this.multihash)
    } else if (this.version === 1) {
      str = multibase.encode(base, this.buffer).toString()
    } else {
      throw new Error('unsupported version')
    }
    if (base === this.multibaseName) {
      // cache the string value
      Object.defineProperty(this, 'string', { value: str })
    }
    return str
  }

  toString (base)/*: BaseEncodedString */ {
    return this.toBaseEncodedString(base)
  }

  /**
   * Serialize to a plain object.
   *
   * @returns {SerializedCID}
   */
  toJSON ()/*: SerializedCID */ {
    return {
      codec: this.codec,
      version: this.version,
      hash: this.multihash
    }
  }

  /**
   * Compare equality with another CID.
   *
   * @param {any} other
   * @returns {bool}
   */
  equals (other/*: mixed */)/*: boolean */ {
    return (
      other != null &&
      typeof other === 'object' &&
      this.codec === other.codec &&
      this.version === other.version &&
      other.multihash instanceof Buffer &&
      this.multihash.equals(other.multihash)
    )
  }

  /**
   * Test if the given input is a valid CID object.
   * Throws if it is not.
   *
   * @param {any} other
   * @returns {void}
   */
  static validateCID (other/*: mixed */)/*: void */ {
    let errorMsg = CIDUtil.checkCIDComponents(other)
    if (errorMsg) {
      throw new Error(errorMsg)
    }
  }

  /**
   * Test if the given value is a valid CID object, if it is returns it back,
   * otherwise returns undefined.
   * @param {any} value
   * @returns {?CID}
   */
  static matchCID (value/*: mixed */)/*: ?CID<a> */ {
    if (module.exports.isCID(value)) {
      // Type checker is unable to refine type through predicate function,
      // but we know value is CID so we use any making type-checker trust
      // our judgment.
      const cid/*: any */ = value
      return cid
    } else {
      return undefined
    }
  }
}

const _CID = withIs(CID, {
  className: 'CID',
  symbolName: '@ipld/js-cid/CID'
})

_CID.codecs = codecs

module.exports = _CID
