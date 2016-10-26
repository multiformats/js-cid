/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multihash = require('multihashes')
const multihashing = require('multihashing-async')

const CID = require('../src')

describe('CID', () => {
  describe('v0', () => {
    it('handles B58Str multihash', () => {
      const mhStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(mhStr)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash').that.eql(multihash.fromB58String(mhStr))

      expect(cid.toBaseEncodedString()).to.be.eql(mhStr)
    })

    it('handles Buffer multihash', (done) => {
      multihashing(Buffer('hello world'), 'sha2-256', (err, mh) => {
        const mhStr = 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'

        const cid = new CID(mh)

        expect(cid).to.have.property('codec', 'dag-pb')
        expect(cid).to.have.property('version', 0)
        expect(cid).to.have.property('multihash').that.eql(mh)

        expect(cid.toBaseEncodedString()).to.be.eql(mhStr)
        done()
      })
    })

    it('create by parts', () => {
      const cid = new CID(0, 'dag-pb', multihash.encode(new Buffer('abc'), 'sha2-256'))

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash')
    })

    it('throws on invalid BS58Str multihash ', () => {
      expect(
        () => new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zIII')
      ).to.throw()
    })
  })

  describe('v1', () => {
    it('handles CID String (multibase encoded)', () => {
      const cidStr = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'

      const cid = new CID(cidStr)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')

      expect(cid.toBaseEncodedString()).to.be.eql(cidStr)
    })

    it('handles CID (no multibase)', () => {
      const cidStr = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const cidBuf = new Buffer('017012207252523e6591fb8fe553d67ff55a86f84044b46a3e4176e10c58fa529a4aabd5', 'hex')

      const cid = new CID(cidBuf)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')

      expect(cid.toBaseEncodedString()).to.be.eql(cidStr)
    })

    it('create by parts', () => {
      const cid = new CID(1, 'dag-cbor', multihash.encode(new Buffer('xyz'), 'sha2-256'))

      expect(cid).to.have.property('codec', 'dag-cbor')
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')
    })
  })

  describe('utilities', () => {
    const h1 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
    const h2 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1o'

    it('.equals v0 to v0', () => {
      expect(
        new CID(h1).equals(new CID(h1))
      ).to.be.eql(true)

      expect(
        new CID(h1).equals(new CID(h2))
      ).to.be.eql(false)
    })

    it('.equals v0 to v1 and vice versa', () => {
      const cidV1Str = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const cidV1 = new CID(cidV1Str)
      const cidV0 = new CID(cidV1.toV0())

      expect(
        cidV0.equals(cidV1)
      ).to.be.eql(false)

      expect(
        cidV1.equals(cidV0)
      ).to.be.eql(false)

      expect(cidV1.multihash).to.eql(cidV0.multihash)
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
