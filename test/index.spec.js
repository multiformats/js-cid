/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const mh = require('multihashes')
const multihashing = require('multihashing')

const CID = require('../src')

describe('CID', () => {
  describe('constructor', () => {
    it('simple', () => {
      const hash = multihashing(Buffer('hello world'), 'sha2-512')
      const cid = new CID(7, 1, hash)

      expect(cid).to.have.property('codec', 7)
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('hash').that.eql(hash)

      expect(cid.toJSON()).to.be.eql(new CID({
        codec: 7,
        version: 1,
        hash: hash
      }))
    })
  })

  describe('v0', () => {
    it('handles base58 multihashes', () => {
      const hash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(hash)

      expect(cid).to.have.property('codec', CID.codecs.protobuf)
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('hash').that.eql(mh.fromB58String(hash))

      expect(cid.toString()).to.be.eql(hash)
    })

    it('throws on invalid hashes', () => {
      expect(
        () => new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zIII')
      ).to.throw()
    })
  })

  describe('utilities', () => {
    const h1 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
    const h2 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1o'

    it('.equals', () => {
      expect(
        new CID(h1).equals(new CID(h1))
      ).to.be.eql(true)

      expect(
        new CID(h1).equals(new CID(h2))
      ).to.be.eql(false)
    })

    it('.isCid', () => {
      expect(
        CID.isCID(new CID(h1))
      ).to.be.eql(true)

      expect(
        CID.isCID(false)
      ).to.be.eql(false)

      expect(
        CID.isCID(new Buffer('hello world'))
      ).to.be.eql(false)
    })
  })
})
