/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const CIDUtil = require('../src/cid-util')

describe('CIDUtil', () => {
  describe('returns error on invalid inputs', () => {
    const invalid = [
      'hello world',
      'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L',
      Buffer.from('hello world'),
      Buffer.from('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT')
    ]

    invalid.forEach((i) => it(`new CID(${Buffer.isBuffer(i) ? 'buffer' : 'string'}<${i.toString()}>)`, () => {
      expect(() => {
        let errMsg = CIDUtil.checkCIDComponents(i)
        expect(errMsg).to.exist()
      }).to.not.throw()
    }))

    invalid.forEach((i) => it(`new CID(0, 'dag-pb', ${Buffer.isBuffer(i) ? 'buffer' : 'string'}<${i.toString()}>)`, () => {
      expect(() => {
        let errMsg = CIDUtil.checkCIDComponents(0, 'dag-pb', i)
        expect(errMsg).to.exist()
      }).to.not.throw()
    }))

    invalid.forEach((i) => it(`new CID(1, 'dag-pb', ${Buffer.isBuffer(i) ? 'buffer' : 'string'}<${i.toString()}>)`, () => {
      expect(() => {
        let errMsg = CIDUtil.checkCIDComponents(1, 'dag-pb', i)
        expect(errMsg).to.exist()
      }).to.not.throw()
    }))
  })
})
