'use strict'

// CID String: <mbase><version><mcodec><mhash>

const multibase = require('multibase')
const codecs = require('../../src').codecs
const multihashing = require('multihashing')

const mh = multihashing(Buffer.from('oh, hey!'), 'sha2-256')

const cid = Buffer.concat([
  Buffer.from('01', 'hex'),
  codecs.dagPB,
  mh
])

const cidStr = multibase.encode('base58btc', cid).toString()

/* eslint-disable no-console */
console.log('CID String (multibase included)')
console.log(cidStr)
console.log('CID in hex (multibase not included)')
console.log(cid.toString('hex'))
