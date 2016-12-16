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
        expect(err).to.not.exist
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

    it('.prefix', () => {
      const cid = new CID(0, 'dag-pb', multihash.encode(new Buffer('abc'), 'sha2-256'))
      expect(cid.prefix.toString('hex')).to.equal('00701203')
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

    it('can roundtrip through cid.toBaseEncodedString()', () => {
      const cid1 = new CID(1, 'dag-cbor', multihash.encode(new Buffer('xyz'), 'sha2-256'))
      const cid2 = new CID(cid1.toBaseEncodedString())

      expect(cid1).to.have.property('codec').that.eql(cid2.codec)
      expect(cid1).to.have.property('version').that.eql(cid2.version)
      expect(cid1).to.have.property('multihash').that.eql(cid2.multihash)
    })

    it('handles multibyte varint encoded codec codes', () => {
      const ethBlockHash = new Buffer('8a8e84c797605fbe75d5b5af107d4220a2db0ad35fd66d9be3d38d87c472b26d', 'hex')
      const mh = multihash.encode(ethBlockHash, 'keccak-256')
      const cid1 = new CID(1, 'eth-block', mh)
      const cid2 = new CID(cid1.toBaseEncodedString())

      expect(cid1).to.have.property('codec', 'eth-block')
      expect(cid1).to.have.property('version', 1)
      expect(cid1).to.have.property('multihash').that.eql(mh)
      expect(cid2).to.have.property('codec', 'eth-block')
      expect(cid2).to.have.property('version', 1)
      expect(cid2).to.have.property('multihash').that.eql(mh)
    })

    it('.prefix', () => {
      const cid = new CID(1, 'dag-cbor', multihash.encode(new Buffer('xyz'), 'sha2-256'))
      expect(cid.prefix.toString('hex')).to.equal('01711203')
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
