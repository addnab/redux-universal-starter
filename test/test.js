/* eslint-env mocha */
import { assert } from 'chai'
import helloWorldPrinter from '../src'

describe('Simple Babel Starter', function () {
  it('should print Hello World', function () {
    assert(helloWorldPrinter() === 'Hello World')
  })
})
