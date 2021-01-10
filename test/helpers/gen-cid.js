/* eslint-disable no-console */
'use strict'

// CID String: <mbase><version><mcodec><mhash>

const multibase = require('multibase')
const codecs = require('../../src').codecs
// @ts-ignore
const multihashing = require('multihashing-async')
const utf8ArrayFromString = require('uint8arrays/from-string')

async function main () {
  const mh = await multihashing(utf8ArrayFromString('oh, hey!'), 'sha2-256')

  const cid = Uint8Array.of(
    1,
    codecs['dag-pb'],
    ...mh
  )

  const cidStr = multibase.encode('base58btc', cid).toString()

  console.log('CID String (multibase included)')
  console.log(cidStr)
  console.log('CID in hex (multibase not included)')
  console.log(cid.toString())
}

main()
  .catch(err => {
    console.error(err)
    process.exit(0)
  })
