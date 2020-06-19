/* eslint-disable no-console */
'use strict'

// CID String: <mbase><version><mcodec><mhash>

const multibase = require('multibase')
const codecs = require('../../src').codecs
const multihashing = require('multihashing-async')
const { Buffer } = require('buffer')

async function main () {
  const mh = await multihashing(Buffer.from('oh, hey!'), 'sha2-256')

  const cid = Buffer.concat([
    Buffer.from('01', 'hex'),
    Buffer.from([codecs['dag-pb']]),
    mh
  ])

  const cidStr = multibase.encode('base58btc', cid).toString()

  console.log('CID String (multibase included)')
  console.log(cidStr)
  console.log('CID in hex (multibase not included)')
  console.log(cid.toString('hex'))
}

main()
  .catch(err => {
    console.error(err)
    process.exit(0)
  })
