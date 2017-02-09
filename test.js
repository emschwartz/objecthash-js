'use strict'

const test = require('tape')
const objectHash = require('.')

test('null', function (t) {
  t.plan(2)

  t.equal(objectHash(null).toString('hex'), '1b16b1df538ba12dc3f97edbb85caa7050d46c148134290feba80f8236c83db9')
  t.equal(objectHash(undefined).toString('hex'), '1b16b1df538ba12dc3f97edbb85caa7050d46c148134290feba80f8236c83db9')
})

test('boolean', function (t) {
  t.plan(2)

  t.equal(objectHash(true).toString('hex'), '7dc96f776c8423e57a2785489a3f9c43fb6e756876d6ad9a9cac4aa4e72ec193')
  t.equal(objectHash(false).toString('hex'), 'c02c0b965e023abee808f2b548d8d5193a8b5229be6f3121a6f16e2d41a449b3')
})

test('number', function (t) {
  t.plan(4)

  t.equal(objectHash(0).toString('hex'), '60101d8c9cb988411468e38909571f357daa67bff5a7b0a3f9ae295cd4aba33d')
  t.equal(objectHash(-0.1).toString('hex'), '55ab03db6fbb5e6de473a612d7e462ca8fd2387266080980e87f021a5c7bde9f')
  t.equal(objectHash(1.2345).toString('hex'), '844e08b1195a93563db4e5d4faa59759ba0e0397caf065f3b6bc0825499754e0')
  t.equal(objectHash(-10.1234).toString('hex'), '59b49ae24998519925833e3ff56727e5d4868aba4ecf4c53653638ebff53c366')
})

test('unicode', function (t) {
  t.plan(3)

  t.equal(objectHash('ԱԲաբ').toString('hex'), '2a2a4485a4e338d8df683971956b1090d2f5d33955a81ecaad1a75125f7a316c')
  t.equal(objectHash('\u03d3').toString('hex'), 'f72826713a01881404f34975447bd6edcb8de40b191dc57097ebf4f5417a554d')
  t.equal(objectHash('\u03d2\u0301').toString('hex'), '42d5b13fb064849a988a86eb7650a22881c0a9ecf77057a1b07ab0dad385889c')
})

test('lists with strings', function (t) {
  t.plan(3)

  t.equal(objectHash([]).toString('hex'), 'acac86c0e609ca906f632b0e2dacccb2b77d22b0621f20ebece1a4835b93f6f0')
  t.equal(objectHash(['foo']).toString('hex'), '268bc27d4974d9d576222e4cdbb8f7c6bd6791894098645a19eeca9c102d0964')
  t.equal(objectHash(['foo', 'bar']).toString('hex'), '32ae896c413cfdc79eec68be9139c86ded8b279238467c216cf2bec4d5f1e4a2')
})

test('lists with integers', function (t) {
  t.plan(4)

  t.equal(objectHash([123]).toString('hex'), '2e72db006266ed9cdaa353aa22b9213e8a3c69c838349437c06896b1b34cee36')
  t.equal(objectHash([1, 2, 3]).toString('hex'), '925d474ac71f6e8cb35dd951d123944f7cabc5cda9a043cf38cd638cc0158db0')
  t.equal(objectHash([123456789012345]).toString('hex'), 'f446de5475e2f24c0a2b0cd87350927f0a2870d1bb9cbaa794e789806e4c0836')
  t.equal(objectHash([123456789012345, 678901234567890]).toString('hex'), 'd4cca471f1c68f62fbc815b88effa7e52e79d110419a7c64c1ebb107b07f7f56')
})

test('objects with lists of strings', function (t) {
  t.plan(3)

  t.equal(objectHash({}).toString('hex'), '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4')
  t.equal(objectHash({"foo": "bar"}).toString('hex'), '7ef5237c3027d6c58100afadf37796b3d351025cf28038280147d42fdc53b960')
  t.equal(objectHash({"foo": ["bar", "baz"], "qux": ["norf"]}).toString('hex'), 'f1a9389f27558538a064f3cc250f8686a0cebb85f1cab7f4d4dcc416ceda3c92')
})

test('order independence', function (t) {
  t.plan(2)

  t.equal(objectHash({"k1": "v1", "k2": "v2", "k3": "v3"}).toString('hex'), 'ddd65f1f7568269a30df7cafc26044537dc2f02a1a0d830da61762fc3e687057')
  t.equal(objectHash({"k2": "v2", "k1": "v1", "k3": "v3"}).toString('hex'), 'ddd65f1f7568269a30df7cafc26044537dc2f02a1a0d830da61762fc3e687057')
})

test('mix of all types', function (t) {
  t.plan(3)

  t.equal(objectHash(["foo", {"bar": ["baz", null, 1.0, 1.5, 0.0001, 1000.0, 2.0, -23.1234, 2.0]}]).toString('hex'),  '783a423b094307bcb28d005bc2f026ff44204442ef3513585e7e73b66e3c2213')
  t.equal(objectHash(["foo", {"bar": ["baz", null, 1, 1.5, 0.0001, 1000, 2, -23.1234, 2]}]).toString('hex'), '783a423b094307bcb28d005bc2f026ff44204442ef3513585e7e73b66e3c2213')
  t.equal(objectHash(["foo", {"b4r": ["baz", null, 1, 1.5, 0.0001, 1000, 2, -23.1234, 2]}]).toString('hex'), '7e01f8b45da35386e4f9531ff1678147a215b8d2b1d047e690fd9ade6151e431')
})

test('redacted', function (t) {
  t.plan(3)

  t.equal(objectHash(["foo", "**REDACTED**96e2aab962831956c80b542f056454be411f870055d37805feb3007c855bd823"]).toString('hex'), '783a423b094307bcb28d005bc2f026ff44204442ef3513585e7e73b66e3c2213')
  t.equal(objectHash(["foo", {"bar": ["**REDACTED**82f70430fa7b78951b3c4634d228756a165634df977aa1fada051d6828e78f30", null, 1.0, 1.5, "**REDACTED**1195afc7f0b70bb9d7960c3615668e072a1cbfbbb001f84871fd2e222a87be1d", 1000.0, 2.0, -23.1234, 2.0]}]).toString('hex'), '783a423b094307bcb28d005bc2f026ff44204442ef3513585e7e73b66e3c2213')
  t.equal(objectHash(["foo", {"**REDACTED**e303ce0bd0f4c1fdfe4cc1e837d7391241e2e047df10fa6101733dc120675dfe": ["baz", null, 1.0, 1.5, 0.0001, 1000.0, 2.0, -23.1234, 2.0]}]).toString('hex'), '783a423b094307bcb28d005bc2f026ff44204442ef3513585e7e73b66e3c2213')
})

