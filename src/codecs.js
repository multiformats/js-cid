'use strict'

/**
 * List of multicodecs available.
 *
 * Consult table at: https://github.com/multiformats/multicodec for more details.
 * @alias Codecs
 *
 * @type {Object}
 * @param {Buffer} raw
 * @param {Buffer} dag-pb
 * @param {Buffer} dag-cbor
 * @param {Buffer} eth-block
 * @param {Buffer} eth-tx
 */
module.exports = {
  raw: new Buffer('00', 'hex'),
  'dag-pb': new Buffer('70', 'hex'),
  'dag-cbor': new Buffer('71', 'hex'),
  'eth-block': new Buffer('90', 'hex'),
  'eth-tx': new Buffer('91', 'hex')
}
