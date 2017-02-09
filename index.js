'use strict'

const crypto = require('crypto')

const NIL_STRING = 'n'
const UNICODE_STRING = 'u'
const BOOLEAN_STRING = 'b'
const INT_STRING = 'i'
const FLOAT_STRING = 'f'
const LIST_STRING = 'l'
const DICT_STRING = 'd'
const REDACTED_REGEX = /^\*\*REDACTED\*\*[0-9a-f]{64}$/i

function hash(str, buf) {
  const bufToHash = Buffer.concat([
    Buffer.from(str, 'utf8'),
    buf])
  const h = crypto.createHash('sha256')
  h.update(bufToHash)
  return h.digest()
}

function normalizeFloat (float) {
  let str = ''

  // special case 0
  if (float === 0) {
    return '+0:'
  }

  // sign
  if (float < 0) {
    str = '-'
    float *= -1
  } else {
    str = '+'
  }

  // exponent
  let exponent = 0
  while (float > 1) {
    float = float /2
    exponent++
  }
  while (float <= 0.5) {
    float = float * 2
    exponent--
  }
  str += exponent + ':'

  // mantissa
  while (float !== 0) {
    if (float >= 1) {
      str += '1'
      float --
    } else {
      str += '0'
    }

    if (str.length >= 1000 || float >= 1) {
      throw new Error('invalid number: ' + float.toString())
    }

    float *= 2
  }

  return str
}

function hashDict (obj) {
  const hashes = Object.keys(obj).map(function (key) {
    return Buffer.concat([
      objectHash(key),
      objectHash(obj[key])])
  })
  hashes.sort(function (bufA, bufB) {
    const a = bufA.toString('hex')
    const b = bufB.toString('hex')
    if (a < b) {
      return -1
    } else if (a > b) {
      return 1
    } else {
      return 0
    }
  })
  return hash(DICT_STRING, Buffer.concat(hashes))
}

function objectHash (obj) {
  if (typeof obj === 'string' && REDACTED_REGEX.test(obj)) {
    return Buffer.from(obj.slice(12), 'hex')
  } else if (typeof obj === 'undefined' || obj === null) {
    return hash(NIL_STRING, Buffer.alloc(0))
  } else if (typeof obj === 'boolean') {
    return hash(BOOLEAN_STRING, Buffer.from((obj ? '1' : '0'), 'utf8'))
  } else if (typeof obj === 'string') {
    return hash(UNICODE_STRING, Buffer.from(obj, 'utf8'))
      /*
  } else if (Number.isInteger(obj)) {
    // note that JS interprets 10.0 as an integer,
    // which may differ from implementations in other languages
    return hash(INT_STRING, Buffer.from('' + obj, 'utf8'))
    */
  } else if (typeof obj === 'number') {
    return hash(FLOAT_STRING, Buffer.from(normalizeFloat(obj), 'utf8'))
  } else if (Array.isArray(obj)) {
    return hash(LIST_STRING, Buffer.concat(obj.map(objectHash)))
  } else if (typeof obj === 'object') {
    return hashDict(obj)
  } else {
    throw new Error('unknown type: ' + typeof obj, obj)
  }
}

module.exports = objectHash

