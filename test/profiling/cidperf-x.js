/* eslint-disable no-console */
'use strict'

const multihashing = require('multihashing-async')
// [1] Original/existing implementation.
// const CID = require('cids')
// [2] New/proposed implementation.
const CID = require('../../src')

// Used to delay the testing for a few seconds.
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Simple test class.
// The purpose of this class is
// to simply test the CID ctor (and, primarily, CID.isCID() method).
class CIDPerfX {
  constructor (mh) {
    this.version = 1
    this.codec = 'dag-pb'
    this.mh = mh
  }

  // i: Running-counter.
  // print: If true, it'll print/dump the CID data.
  run (i, print) {
    const cid = new CID(this.version, this.codec, this.mh)
    if (print === true) {
      console.log('i=' + i, cid)
    }
  }
}

// /////////////////////////
// Main test routine.
// Note: You will need to run the test separately
//       for each "alternative" impls and compare their results.
// /////////////////////////

const reps = 10000

console.log(`Test: Will run "new CID()" ${reps} times.`)
// We just give ~1 second for the JS engine to start and 'rest', etc.
// before starting new tests.
sleep(1000).then(async () => {
  console.log('Starting a test...')
  console.time('run')

  const mh = await multihashing(Buffer.from('oh, hey!'), 'sha2-256')
  const cidPerf = new CIDPerfX(mh);

  [...Array(reps).keys()].map(i => {
    cidPerf.run(i)
  })
  console.timeEnd('run')
})
