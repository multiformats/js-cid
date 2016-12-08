'use strict'
const varint = require('varint')

module.exports = {
  numberToBuffer,
  bufferToNumber,
  varintBufferEncode,
  varintBufferDecode
}

function bufferToNumber (buf) {
  return parseInt(buf.toString('hex'), 16)
}

function numberToBuffer (num) {
  let hexString = num.toString(16)
  if (hexString.length % 2 === 1) {
    hexString = '0' + hexString
  }
  return new Buffer(hexString, 'hex')
}

function varintBufferEncode (input) {
  return new Buffer(varint.encode(bufferToNumber(input)))
}

function varintBufferDecode (input) {
  return numberToBuffer(varint.decode(input))
}
