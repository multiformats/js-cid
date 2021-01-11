/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('aegir/utils/chai')
// @ts-ignore
const multihashing = require('multihashing-async')
const CID = require('../src')
const CIDUtil = require('../src/cid-util')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('CIDUtil', () => {
  /** @type {Uint8Array} */
  let hash

  before(async () => {
    hash = await multihashing(uint8ArrayFromString('abc'), 'sha2-256')
  })

  describe('checkCIDComponents()', () => {
    describe('returns undefined on valid CID', () => {
      it('create from B58Str multihash', () => {
        expect(() => {
          const mhStr = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
          const cid = new CID(mhStr)
          const errMsg = CIDUtil.checkCIDComponents(cid)
          expect(errMsg).to.not.exist()
        }).to.not.throw()
      })
      it('create by parts', () => {
        expect(() => {
          const cid = new CID(1, 'dag-cbor', hash)
          const errMsg = CIDUtil.checkCIDComponents(cid)
          expect(errMsg).to.not.exist()
        }).to.not.throw()
      })
    })

    describe('returns non-null error message on invalid inputs', () => {
      const invalid = [
        'hello world',
        'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L',
        uint8ArrayFromString('hello world'),
        uint8ArrayFromString('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT')
      ]

      invalid.forEach((i) => it(`new CID(${i instanceof Uint8Array ? 'Uint8Array' : 'String'}<${i.toString()}>)`, () => {
        expect(() => {
          const errMsg = CIDUtil.checkCIDComponents(i)
          expect(errMsg).to.exist()
        }).to.not.throw()
      }))

      invalid.forEach((i) => it(`new CID(0, 'dag-pb', ${i instanceof Uint8Array ? 'Uint8Array' : 'String'}<${i.toString()}>)`, () => {
        expect(() => {
          const errMsg = CIDUtil.checkCIDComponents(0)
          expect(errMsg).to.exist()
        }).to.not.throw()
      }))

      invalid.forEach((i) => it(`new CID(1, 'dag-pb', ${i instanceof Uint8Array ? 'Uint8Array' : 'String'}<${i.toString()}>)`, () => {
        expect(() => {
          const errMsg = CIDUtil.checkCIDComponents(1)
          expect(errMsg).to.exist()
        }).to.not.throw()
      }))
    })
  })
})
