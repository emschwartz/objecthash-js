# objecthash
> Implementation of [Ben Laurie's objecthash](https://github.com/benlaurie/objecthash) in Javascript

## Installation

`npm install --save objecthash`

## Usage
Takes any JSON value and returns a `Buffer` with the SHA-256 `objecthash`, derived using Ben Laurie's algorithm.

## A note on (the inconsistency of) numbers

Different languages treat numbers parsed from JSON differently.

Javascript treats both `1` and `1.0` as an integer, whereas Go parses all JSON numbers as 64-bit floating point numbers.

In an effort to maintain compatibility with the other implementations, this library treats all numbers as floats by default.

