'use strict'

const mh = require('multihashes')

var CIDUtil = {
  /**
   * Test if the given input is a valid CID object.
   * Returns an error message if it is not, or
   * Throws an error its multihash is invalid.
   *
   * @param {any} other
   * @returns {string}
   */
  checkCIDComponents: function (other) {
    if (other == null) {
      return 'null values are not valid CIDs'
    }

    if (!(other.version === 0 || other.version === 1)) {
      return 'Invalid version, must be a number equal to 1 or 0'
    }

    if (typeof other.codec !== 'string') {
      return 'codec must be string'
    }

    if (!Buffer.isBuffer(other.multihash)) {
      throw new Error('multihash must be a Buffer')
    }

    mh.validate(other.multihash)
    return null
  }
}

module.exports = CIDUtil
