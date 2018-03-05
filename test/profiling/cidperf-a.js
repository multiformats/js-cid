'use strict'

const codecs = require('multicodec/src/base-table')
const multihashing = require('multihashing')
// const CID1 = require('../../src')
const CID1 = require('./alt-impl/cid1') // Original/existing implementation.
const CID2 = require('./alt-impl/cid2') // New/proposed implementation.

// Used to delay the testing for a few seconds.
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Simple test class.
// The purpose of this class is
// to simply test the CID ctor (and, primarily, CID.isCID() method).
class CIDPerfA {
  constructor () {
    this.version = 1
    this.codec = codecs.base8.toString()
    // console.log(codecs.base10)
    this.mh = multihashing(Buffer.from('oh, hey!'), 'sha2-256')
  }

  // i: Running-counter.
  // print: If true, it'll print/dump the CID data.
  run1 (i, print) {
    const cid = new CID1(this.version, this.codec, this.mh)
    if (print === true) {
      console.log('i=' + i, cid)
    }
    // const cidStr = cid.toString('hex')
    // console.log('cidStr (hex) = ' + cidStr)
  }

  run2 (i, print) {
    const cid = new CID2(this.version, this.codec, this.mh)
    if (print === true) {
      console.log('i=' + i, cid)
    }
  }
}

// /////////////////////////
// Main test routine.
// /////////////////////////

const reps = 10000
const cidPerf = new CIDPerfA()

// We just give ~1 second for the JS engine to start and 'rest', etc.
// before starting new tests.
sleep(1000).then(() => {
  // [1] For original impl.
  console.time('run1'); [...Array(reps).keys()].map(i => {
    cidPerf.run1(i)
  })
  console.timeEnd('run1')

  sleep(1000).then(() => {
    // [2] For alternative impl.
    console.time('run2'); [...Array(reps).keys()].map(i => {
      cidPerf.run2(i, false)
    })
    console.timeEnd('run2')
  })
})
