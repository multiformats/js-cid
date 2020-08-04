/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('aegir/utils/chai')
const multihash = require('multihashes')
const multihashing = require('multihashing-async')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const CID = require('../src')

describe('CID', () => {
  let hash

  before(async () => {
    hash = await multihashing(uint8ArrayFromString('abc'), 'sha2-256')
  })

  describe('v0', () => {
    it('handles B58Str multihash', () => {
      const mhStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(mhStr)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('code', 112)
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash').that.eql(multihash.fromB58String(mhStr))
      expect(cid).to.have.property('multibaseName', 'base58btc')

      expect(cid.toBaseEncodedString()).to.be.eql(mhStr)
    })

    it('handles Uint8Array multihash', async () => {
      const mh = await multihashing(uint8ArrayFromString('hello world'), 'sha2-256')
      const mhStr = 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'

      const cid = new CID(mh)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('code', 112)
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash').that.eql(mh)
      expect(cid).to.have.property('multibaseName', 'base58btc')

      expect(cid.toBaseEncodedString()).to.eql(mhStr)
    })

    it('create by parts', () => {
      const cid = new CID(0, 'dag-pb', hash)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('code', 112)
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash')
      expect(cid).to.have.property('multibaseName', 'base58btc')
    })

    it('create by parts (int codec)', () => {
      const cid = new CID(0, 112, hash)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('code', 112)
      expect(cid).to.have.property('version', 0)
      expect(cid).to.have.property('multihash')
      expect(cid).to.have.property('multibaseName', 'base58btc')
    })

    it('throws on invalid BS58Str multihash ', () => {
      expect(
        () => new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zIII')
      ).to.throw()
    })

    it('throws on trying to create a CIDv0 with a codec other than dag-pb', () => {
      expect(
        () => new CID(0, 'dag-cbor', hash)
      ).to.throw("codec must be 'dag-pb' for CIDv0")
    })

    it('throws on trying to create a CIDv0 with a base other than base58btc', () => {
      expect(
        () => new CID(0, 'dag-pb', hash, 'base32')
      ).to.throw("multibaseName must be 'base58btc' for CIDv0")
    })

    it('throws on trying to base encode CIDv0 in other base than base58btc', () => {
      const mhStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(mhStr)
      expect(() => cid.toBaseEncodedString('base16')).to.throw()
    })

    it('.prefix', () => {
      const cid = new CID(0, 'dag-pb', hash)
      expect(uint8ArrayToString(cid.prefix, 'base16')).to.equal('00701220')
    })

    it('.bytes', () => {
      const codec = 'dag-pb'
      const cid = new CID(0, codec, hash)
      const bytes = cid.bytes
      expect(bytes).to.exist()
      const str = uint8ArrayToString(bytes, 'base16')
      expect(str).to.equals('1220ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })

    it('should construct from an old CID without a multibaseName', () => {
      const cidStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'

      const oldCid = new CID(cidStr)
      delete oldCid.multibaseName // Fake it

      const newCid = new CID(oldCid)

      expect(newCid.multibaseName).to.equal('base58btc')
      expect(newCid.toString()).to.equal(cidStr)
    })
  })

  describe('v1', () => {
    it('handles CID String (multibase encoded)', () => {
      const cidStr = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'

      const cid = new CID(cidStr)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('code', 112)
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')
      expect(cid).to.have.property('multibaseName', 'base58btc')

      expect(cid.toBaseEncodedString()).to.be.eql(cidStr)
    })

    it('handles CID (no multibase)', () => {
      const cidStr = 'bafybeidskjjd4zmr7oh6ku6wp72vvbxyibcli2r6if3ocdcy7jjjusvl2u'
      const cidBuf = uint8ArrayFromString('017012207252523e6591fb8fe553d67ff55a86f84044b46a3e4176e10c58fa529a4aabd5', 'base16')

      const cid = new CID(cidBuf)

      expect(cid).to.have.property('codec', 'dag-pb')
      expect(cid).to.have.property('code', 112)
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')
      expect(cid).to.have.property('multibaseName', 'base32')

      expect(cid.toBaseEncodedString()).to.be.eql(cidStr)
    })

    it('handles ED25519 PeerID as CID in Base36', () => {
      const peerIdStr = 'k51qzi5uqu5dj16qyiq0tajolkojyl9qdkr254920wxv7ghtuwcz593tp69z9m'

      const cid = new CID(peerIdStr)

      expect(cid).to.have.property('codec', 'libp2p-key')
      expect(cid).to.have.property('code', 114)
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')
      expect(cid).to.have.property('multibaseName', 'base36')

      expect(cid.toBaseEncodedString()).to.be.eql(peerIdStr)
    })

    it('create by parts', () => {
      const cid = new CID(1, 'dag-cbor', hash)

      expect(cid).to.have.property('codec', 'dag-cbor')
      expect(cid).to.have.property('code', 113)
      expect(cid).to.have.property('version', 1)
      expect(cid).to.have.property('multihash')
      expect(cid).to.have.property('multibaseName', 'base32')
    })

    it('can roundtrip through cid.toBaseEncodedString()', () => {
      const cid1 = new CID(1, 'dag-cbor', hash)
      const cid2 = new CID(cid1.toBaseEncodedString())

      expect(cid1).to.have.property('codec').that.eql(cid2.codec)
      expect(cid1).to.have.property('code').that.eql(cid2.code)
      expect(cid1).to.have.property('version').that.eql(cid2.version)
      expect(cid1).to.have.property('multihash').that.eql(cid2.multihash)
      expect(cid1).to.have.property('multibaseName').that.eql(cid2.multibaseName)
    })

    it('handles multibyte varint encoded codec codes', () => {
      const ethBlockHash = uint8ArrayFromString('8a8e84c797605fbe75d5b5af107d4220a2db0ad35fd66d9be3d38d87c472b26d', 'base16')
      const mh = multihash.encode(ethBlockHash, 'keccak-256')
      const cid1 = new CID(1, 'eth-block', mh)
      const cid2 = new CID(cid1.toBaseEncodedString())

      expect(cid1).to.have.property('codec', 'eth-block')
      expect(cid1).to.have.property('code', 144)
      expect(cid1).to.have.property('version', 1)
      expect(cid1).to.have.property('multihash').that.eql(mh)
      expect(cid1).to.have.property('multibaseName', 'base32')
      expect(cid2).to.have.property('codec', 'eth-block')
      expect(cid2).to.have.property('version', 1)
      expect(cid2).to.have.property('multihash').that.eql(mh)
      expect(cid2).to.have.property('multibaseName', 'base32')
    })

    it('.prefix', () => {
      const cid = new CID(1, 'dag-cbor', hash)
      expect(uint8ArrayToString(cid.prefix, 'base16')).to.equal('01711220')
    })

    it('.prefix identity multihash', () => {
      const mh = multihash.encode(uint8ArrayFromString('abc'), 'identity')
      const cid0 = new CID(0, 'dag-pb', mh)

      expect(cid0).to.have.property('codec', 'dag-pb')
      expect(cid0).to.have.property('code', 112)
      expect(cid0).to.have.property('version', 0)
      expect(cid0).to.have.property('multihash').that.eql(mh)
      expect(cid0.toBaseEncodedString()).to.eql('161g3c')

      const cid1 = new CID(1, 'dag-cbor', mh)

      expect(cid1).to.have.property('codec', 'dag-cbor')
      expect(cid1).to.have.property('code', 113)
      expect(cid1).to.have.property('version', 1)
      expect(cid1).to.have.property('multihash').that.eql(mh)
      expect(cid1.toBaseEncodedString()).to.eql('bafyqaa3bmjrq')
    })

    it('.bytes', () => {
      const codec = 'dag-cbor' // Invalid codec will cause an error: Issue #46
      const cid = new CID(1, codec, hash)
      const bytes = cid.bytes
      expect(bytes).to.exist()
      const str = uint8ArrayToString(bytes, 'base16')
      expect(str).to.equals('01711220ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    })

    it('throws error on unknown codec when base encoding it', () => {
      expect(() => {
        new CID(1, 'this-codec-doesnt-exist', hash).toBaseEncodedString()
      }).to.throw(
        'Codec `this-codec-doesnt-exist` not found'
      )
    })

    it('should construct from an old CID without a multibaseName', () => {
      const cidStr = 'bafybeidskjjd4zmr7oh6ku6wp72vvbxyibcli2r6if3ocdcy7jjjusvl2u'

      const oldCid = new CID(cidStr)
      delete oldCid.multibaseName // Fake it

      const newCid = new CID(oldCid)

      expect(newCid.multibaseName).to.equal('base32')
      expect(newCid.toString()).to.equal(cidStr)
    })
  })

  describe('.toString', () => {
    it('returns a CID string', () => {
      const cid = new CID(hash)
      expect(cid.toString()).to.equal('QmatYkNGZnELf8cAGdyJpUca2PyY4szai3RHyyWofNY1pY')
    })

    it('returns a string in the same base as the string passed to the constructor - base64 flavour', () => {
      const base64Str = 'mAXASIOnrbGCADfkPyOI37VMkbzluh1eaukBqqnl2oFaFnuIt'
      const cid = new CID(base64Str)
      expect(cid.toString()).to.equal(base64Str)
    })

    it('returns a string in the same base as the string passed to the constructor - base16 flavour', () => {
      const base16Str = 'f01701220e9eb6c60800df90fc8e237ed53246f396e87579aba406aaa7976a056859ee22d'
      const cid = new CID(base16Str)
      expect(cid.toString()).to.equal(base16Str)
    })

    it('returns a string in the base provided', () => {
      const b58v1Str = 'zdj7Wd8AMwqnhJGQCbFxBVodGSBG84TM7Hs1rcJuQMwTyfEDS'
      const b64urlv1Str = 'uAXASIHJSUj5lkfuP5VPWf_VahvhARLRqPkF24QxY-lKaSqvV'
      const cid = new CID(b58v1Str)
      expect(cid.toString('base64url')).to.equal(b64urlv1Str)
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

    it('.equals a similar CID with a Uint8Array multihash', () => {
      const str = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      const cid = new CID(str)
      const cidA = new CID(cid.version, cid.codec, Uint8Array.from(cid.multihash))
      const cidB = new CID(str)

      expect(cidA.equals(cidB)).to.equal(true)
    })

    it('.isCid', () => {
      expect(
        CID.isCID(new CID(h1))
      ).to.equal(true)

      expect(
        CID.isCID(false)
      ).to.equal(false)

      expect(
        CID.isCID(uint8ArrayFromString('hello world'))
      ).to.equal(false)

      expect(
        CID.isCID(new CID(h1).toV0())
      ).to.equal(true)

      expect(
        CID.isCID(new CID(h1).toV1())
      ).to.equal(true)
    })
  })

  describe('throws on invalid inputs', () => {
    const invalid = [
      'hello world',
      'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L',
      uint8ArrayFromString('hello world'),
      uint8ArrayFromString('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT')
    ]

    invalid.forEach((i) => it(`new CID(${i instanceof Uint8Array ? 'Uint8Array' : 'String'}<${i.toString()}>)`, () => {
      expect(() => new CID(i)).to.throw()
    }))

    invalid.forEach((i) => it(`new CID(0, 'dag-pb', ${i instanceof Uint8Array ? 'Uint8Array' : 'String'}<${i.toString()}>)`, () => {
      expect(() => new CID(0, 'dag-pb', i)).to.throw()
    }))

    invalid.forEach((i) => it(`new CID(1, 'dag-pb', ${i instanceof Uint8Array ? 'Uint8Array' : 'String'}<${i.toString()}>)`, () => {
      expect(() => new CID(1, 'dag-pb', i)).to.throw()
    }))

    const invalidVersions = [-1, 2]
    invalidVersions.forEach((i) => it(`new CID(${i}, 'dag-pb', bytes)`, () => {
      expect(() => new CID(i, 'dag-pb', hash)).to.throw()
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
    it('should convert v0 to v1', async () => {
      const hash = await multihashing(uint8ArrayFromString(`TEST${Date.now()}`), 'sha2-256')
      const cid = new CID(0, 'dag-pb', hash).toV1()
      expect(cid.version).to.equal(1)
    })

    it('should convert v1 to v0', async () => {
      const hash = await multihashing(uint8ArrayFromString(`TEST${Date.now()}`), 'sha2-256')
      const cid = new CID(1, 'dag-pb', hash).toV0()
      expect(cid.version).to.equal(0)
    })

    it('should not convert v1 to v0 if not dag-pb codec', async () => {
      const hash = await multihashing(uint8ArrayFromString(`TEST${Date.now()}`), 'sha2-256')
      const cid = new CID(1, 'dag-cbor', hash)
      expect(() => cid.toV0()).to.throw('Cannot convert a non dag-pb CID to CIDv0')
    })

    it('should not convert v1 to v0 if not sha2-256 multihash', async () => {
      const hash = await multihashing(uint8ArrayFromString(`TEST${Date.now()}`), 'sha2-512')
      const cid = new CID(1, 'dag-pb', hash)
      expect(() => cid.toV0()).to.throw('Cannot convert non sha2-256 multihash CID to CIDv0')
    })

    it('should not convert v1 to v0 if not 32 byte multihash', async () => {
      const hash = await multihashing(uint8ArrayFromString(`TEST${Date.now()}`), 'sha2-256', 31)
      const cid = new CID(1, 'dag-pb', hash)
      expect(() => cid.toV0()).to.throw('Cannot convert non 32 byte multihash CID to CIDv0')
    })
  })

  describe('caching', () => {
    it('should cache CID as bytes', async () => {
      const hash = await multihashing(uint8ArrayFromString(`TEST${Date.now()}`), 'sha2-256')
      const cid = new CID(1, 'dag-pb', hash)
      expect(cid.bytes).to.equal(cid.bytes)
      // Make sure custom implementation detail properties don't leak into
      // the prototype
      expect(Object.prototype.hasOwnProperty.call(cid, 'bytes')).to.be.false()
    })
    it('should cache string representation when it matches the multibaseName it was constructed with', () => {
      // not string to cache yet
      const cid = new CID(1, 'dag-pb', hash, 'base32')
      expect(cid.string).to.be.undefined()

      // we dont cache alternate base encodings yet.
      expect(cid.toBaseEncodedString('base64')).to.equal('mAXASILp4Fr+PAc/qQUFA3l2uIiOwA2Gjlhd6nLQQ/2HyABWt')
      expect(cid.string).to.be.undefined()

      const base32String = 'bafybeif2pall7dybz7vecqka3zo24irdwabwdi4wc55jznaq75q7eaavvu'
      expect(cid.toBaseEncodedString()).to.equal(base32String)

      // it cached!
      expect(cid.string).to.equal(base32String)
      // Make sure custom implementation detail properties don't leak into
      // the prototype
      expect(Object.prototype.hasOwnProperty.call(cid, '_string')).to.be.false()
      expect(cid.toBaseEncodedString()).to.equal(base32String)
      expect(cid.toBaseEncodedString('base64')).to.equal('mAXASILp4Fr+PAc/qQUFA3l2uIiOwA2Gjlhd6nLQQ/2HyABWt')

      // alternate base not cached!
      expect(cid.string).to.equal(base32String)
    })
    it('should cache string representation when constructed with one', () => {
      const base32String = 'bafybeif2pall7dybz7vecqka3zo24irdwabwdi4wc55jznaq75q7eaavvu'
      const cid = new CID(base32String)
      expect(cid.string).to.equal(base32String)
      expect(cid.toBaseEncodedString('base64')).to.equal('mAXASILp4Fr+PAc/qQUFA3l2uIiOwA2Gjlhd6nLQQ/2HyABWt')
      expect(cid.string).to.equal(base32String)
      expect(cid.toBaseEncodedString()).to.equal(base32String)
    })
  })
})
