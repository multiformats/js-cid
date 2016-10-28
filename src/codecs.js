'use strict'

/**
 * List of supported codecs.
 * For details consult the table at: https://github.com/multiformats/multicodec.
 * @typedef {Object} Codecs
 * @property {Buffer}: raw
 * @property {Buffer}: dag-pb
 * @property {Buffer}: dag-cbor
 * @property {Buffer}: eth-block
 * @property {Buffer}: eth-tx
 */
module.exports = {
  raw: new Buffer('00', 'hex'),
  'dag-pb': new Buffer('70', 'hex'),
  'dag-cbor': new Buffer('71', 'hex'),
  'eth-block': new Buffer('90', 'hex'),
  'eth-tx': new Buffer('91', 'hex')
}
