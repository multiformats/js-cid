/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const multihash = require('multihashes')
const multihashing = require('multihashing-async')

const CID = require('../src')

describe('CID', () => {
  let hash

  before((done) => {
    multihashing(new Buffer('abc'), 'sha2-256', (err, d) => {
      if (err) {
        return done(err)
      }
      hash = d
      done()
    })
  })

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
        expect(err).to.not.exist()
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
      const cid = new CID(0, 'dag-pb', hash)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash')
    })

    it('throws on invalid BS58Str multihash ', () => {
      expect(
        () => new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zIII')
      ).to.throw()
    })

    it('throws on trying to base encode CIDv0 in other base than base58 ', () => {
      const mhStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(mhStr)
      expect(() => cid.toBaseEncodedString('base16')).to.throw()
    })

    it('.prefix', () => {
      const cid = new CID(0, 'dag-pb', hash)
      expect(cid.prefix.toString('hex')).to.equal('00701220')
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
      const cid = new CID(1, 'dag-cbor', hash)

      expect(cid).to.have.property('codec', 'dag-cbor')
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')
    })

    it('can roundtrip through cid.toBaseEncodedString()', () => {
      const cid1 = new CID(1, 'dag-cbor', hash)
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
      const cid = new CID(1, 'dag-cbor', hash)
      expect(cid.prefix.toString('hex')).to.equal('01711220')
    })
  })

  describe('utilities', () => {
    const h1 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
    const h2 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1o'

    it('.equals v0 to v0', () => {
      expect(
        new CID(h1).equals(new CID(h1))
      ).to.be.true

      expect(
        new CID(h1).equals(new CID(h2))
      ).to.be.false
    })

    it('.equals v0 to v1 and vice versa', () => {
      const cidV1Str = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const cidV1 = new CID(cidV1Str)
      const cidV0 = cidV1.toV0()

      expect(cidV0.equals(cidV1)).to.be.false

      expect(cidV1.equals(cidV0)).to.be.false

      expect(cidV1.multihash).to.eql(cidV0.multihash)
    })

    it('.isCid', () => {
      expect(
        CID.isCID(new CID(h1))
      ).to.be.true

      expect(
        CID.isCID(false)
      ).to.be.false

      expect(
        CID.isCID(new Buffer('hello world'))
      ).to.be.false
    })
  })

  describe('throws on invalid inputs', () => {
    const invalid = [
      'hello world',
      'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L',
      new Buffer('hello world'),
      new Buffer('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT')
    ]

    invalid.forEach((i) => it(`new CID(${Buffer.isBuffer(i) ? 'buffer' : 'string'}<${i.toString()}>)`, () => {
      expect(() => new CID(i)).to.throw()
    }))

    invalid.forEach((i) => it(`new CID(0, 'dag-pb', ${Buffer.isBuffer(i) ? 'buffer' : 'string'}<${i.toString()}>)`, () => {
      expect(() => new CID(0, 'dag-pb', i)).to.throw()
    }))

    invalid.forEach((i) => it(`new CID(1, 'dag-pb', ${Buffer.isBuffer(i) ? 'buffer' : 'string'}<${i.toString()}>)`, () => {
      expect(() => new CID(1, 'dag-pb', i)).to.throw()
    }))
  })

  describe('idempotence', () => {
    const h1 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
    const cid1 = new CID(h1)
    const cid2 = new CID(cid1)

    it('constructor accept constructed instance', () => {
      expect(cid1.equals(cid2)).to.be.true
      expect(cid1 === cid2).to.be.false
    })
  })
})
