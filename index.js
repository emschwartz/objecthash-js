'use strict'

const crypto = require('crypto')
const BigNumber = require('bignumber.js')

const NIL_STRING = 'n'
const UNICODE_STRING = 'u'
const BOOLEAN_STRING = 'b'
const INT_STRING = 'i'
const FLOAT_STRING = 'f'

function hash(str, buf) {
  const bufToHash = Buffer.concat([
    Buffer.from(str, 'utf8'),
    buf])
  const h = crypto.createHash('sha256')
  h.update(bufToHash)
  return h.digest()
}

function normalizeFloat (float) {
  let bn = float
  let str = ''

  // special case 0
  if (bn.isZero()) {
    return '+0:'
  }

  // sign
  if (bn.lessThan(0)) {
    str = '-'
    bn = bn.negated()
  } else {
    str = '+'
  }

  // exponent
  let exponent = 0
  while (bn.greaterThan(1)) {
    bn = bn.div(2)
    exponent++
  }
  while (bn.lessThanOrEqualTo(0.5)) {
    bn = bn.times(2)
    exponent--
  }
  str += exponent + ':'

  // mantissa
  for (let i = 0; i < 54; i++) {
    if (bn.isZero()) {
      break
    }

    if (bn.greaterThanOrEqualTo(1)) {
      str += '1'
      bn = bn.minus(1)
    } else {
      str += '0'
    }

    if (str.length >= 1000 || bn.greaterThanOrEqualTo(1)) {
      throw new Error('invalid number: ' + float.toString())
    }

    bn = bn.times(2)
  }

  return str
}

function objectHash (obj) {
  if (typeof obj === 'undefined' || obj === null) {
    return hash(NIL_STRING, Buffer.alloc(0))
  } else if (typeof obj === 'boolean') {
    return hash(BOOLEAN_STRING, Buffer.from((obj ? '1' : '0'), 'utf8'))
  } else if (typeof obj === 'string') {
    return hash(UNICODE_STRING, Buffer.from(obj, 'utf8'))
  } else if (typeof obj === 'number' || (typeof obj === 'object' && obj.isBigNumber)) {
    const bn = new BigNumber(obj)
    if (bn.isInteger()) {
      return hash(INT_STRING, Buffer.from(bn.toString(), 'utf8'))
    } else {
      return hash(FLOAT_STRING, Buffer.from(normalizeFloat(bn), 'utf8'))
    }
  } else {
    throw new Error('unknown type: ' + typeof obj, obj)
  }
}

console.log(objectHash((new BigNumber('-1.0'))).toString('hex'))
console.log(objectHash((new BigNumber('0.0'))).toString('hex'))
console.log(objectHash((new BigNumber('10.0'))).toString('hex'))
console.log(objectHash((new BigNumber('1000.0'))).toString('hex'))
console.log(objectHash(1.2345).toString('hex'))
console.log(objectHash(-10.1234).toString('hex'))

module.exports = objectHash

