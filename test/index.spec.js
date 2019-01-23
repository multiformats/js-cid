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
    multihashing(Buffer.from('abc'), 'sha2-256', (err, d) => {
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
      multihashing(Buffer.from('hello world'), 'sha2-256', (err, mh) => {
        expect(err).to.not.exist()
        const mhStr = 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'

        const cid = new CID(mh)

        expect(cid).to.have.property('codec', 'dag-pb')
        expect(cid).to.have.property('version', 0)
        expect(cid).to.have.property('multihash').that.eql(mh)

        expect(cid.toBaseEncodedString()).to.eql(mhStr)
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

    it('.buffer', () => {
      const codec = 'dag-pb'
      const cid = new CID(0, codec, hash)
      const buffer = cid.buffer
      expect(buffer).to.exist()
      const str = buffer.toString('hex')
      expect(str).to.equals('1220ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })
  })

  describe('v1', () => {
    it('handles CID String (multibase encoded)', () => {
      const cidStr = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'

      const cid = new CID(cidStr)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')

      expect(cid.toBaseEncodedString('base58btc')).to.be.eql(cidStr)
    })

    it('handles CID (no multibase)', () => {
      const cidStr = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const cidBuf = Buffer.from('017012207252523e6591fb8fe553d67ff55a86f84044b46a3e4176e10c58fa529a4aabd5', 'hex')

      const cid = new CID(cidBuf)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')

      expect(cid.toBaseEncodedString('base58btc')).to.be.eql(cidStr)
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
      const ethBlockHash = Buffer.from('8a8e84c797605fbe75d5b5af107d4220a2db0ad35fd66d9be3d38d87c472b26d', 'hex')
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

    it('.buffer', () => {
      const codec = 'dag-cbor' // Invalid codec will cause an error: Issue #46
      const cid = new CID(1, codec, hash)
      const buffer = cid.buffer
      expect(buffer).to.exist()
      const str = buffer.toString('hex')
      expect(str).to.equals('01711220ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })

    it('throws error on unknown codec when base encoding it', () => {
      expect(() => {
        new CID(1, 'this-codec-doesnt-exist', hash).toBaseEncodedString()
      }).to.throw(
        'Codec `this-codec-doesnt-exist` not found'
      )
    })
  })

  describe('utilities', () => {
    const h1 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
    const h2 = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1o'

    it('.equals v0 to v0', () => {
      expect(new CID(h1).equals(new CID(h1))).to.equal(true)
      expect(new CID(h1).equals(new CID(h2))).to.equal(false)
    })

    it('.equals v0 to v1 and vice versa', () => {
      const cidV1Str = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const cidV1 = new CID(cidV1Str)
      const cidV0 = cidV1.toV0()

      expect(cidV0.equals(cidV1)).to.equal(false)
      expect(cidV1.equals(cidV0)).to.equal(false)
      expect(cidV1.multihash).to.eql(cidV0.multihash)
    })

    it('.isCid', () => {
      expect(
        CID.isCID(new CID(h1))
      ).to.equal(true)

      expect(
        CID.isCID(false)
      ).to.equal(false)

      expect(
        CID.isCID(Buffer.from('hello world'))
      ).to.equal(false)

      expect(
        CID.isCID(new CID(h1).toV0())
      ).to.equal(true)

      expect(
        CID.isCID(new CID(h1).toV1())
      ).to.equal(true)
    })

    it('.toString() outputs default base encoded CID', () => {
      const mhStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(mhStr)
      expect(`${cid}`).to.equal(mhStr)
    })

    it('.toString(base) outputs base encoded CID', () => {
      const b58v1Str = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const b32v1Str = 'bafybeidskjjd4zmr7oh6ku6wp72vvbxyibcli2r6if3ocdcy7jjjusvl2u'
      const cid = new CID(b58v1Str)
      expect(cid.toString('base32')).to.equal(b32v1Str)
    })
  })

  describe('throws on invalid inputs', () => {
    const invalid = [
      'hello world',
      'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L',
      Buffer.from('hello world'),
      Buffer.from('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT')
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
      expect(cid1.equals(cid2)).to.equal(true)
      expect(cid1 === cid2).to.equal(false)
    })
  })

  describe('conversion v0 <-> v1', () => {
    it('should convert v0 to v1', done => {
      multihashing(Buffer.from(`TEST${Date.now()}`), 'sha2-256', (err, hash) => {
        if (err) return done(err)
        const cid = new CID(0, 'dag-pb', hash).toV1()
        expect(cid.version).to.equal(1)
        done()
      })
    })

    it('should convert v1 to v0', done => {
      multihashing(Buffer.from(`TEST${Date.now()}`), 'sha2-256', (err, hash) => {
        if (err) return done(err)
        const cid = new CID(1, 'dag-pb', hash).toV0()
        expect(cid.version).to.equal(0)
        done()
      })
    })

    it('should not convert v1 to v0 if not dag-pb codec', done => {
      multihashing(Buffer.from(`TEST${Date.now()}`), 'sha2-256', (err, hash) => {
        if (err) return done(err)
        const cid = new CID(1, 'dag-cbor', hash)
        expect(() => cid.toV0()).to.throw('Cannot convert a non dag-pb CID to CIDv0')
        done()
      })
    })

    it('should not convert v1 to v0 if not sha2-256 multihash', done => {
      multihashing(Buffer.from(`TEST${Date.now()}`), 'sha2-512', (err, hash) => {
        if (err) return done(err)
        const cid = new CID(1, 'dag-pb', hash)
        expect(() => cid.toV0()).to.throw('Cannot convert non sha2-256 multihash CID to CIDv0')
        done()
      })
    })

    it('should not convert v1 to v0 if not 32 byte multihash', done => {
      multihashing(Buffer.from(`TEST${Date.now()}`), 'sha2-256', 31, (err, hash) => {
        if (err) return done(err)
        const cid = new CID(1, 'dag-pb', hash)
        expect(() => cid.toV0()).to.throw('Cannot convert non 32 byte multihash CID to CIDv0')
        done()
      })
    })
  })
})
