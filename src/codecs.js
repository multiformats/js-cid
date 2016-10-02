'use strict'

/*
 * Consult table at: https://github.com/multiformats/multicodec
 */

module.exports = {
  raw: new Buffer('00', 'hex'),
  'dag-pb': new Buffer('70', 'hex'),
  'dag-cbor': new Buffer('71', 'hex'),
  'eth-block': new Buffer('90', 'hex'),
  'eth-tx': new Buffer('91', 'hex')
}
