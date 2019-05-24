/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import main from '../../src/index'

describe('normal', () => {
  it(`function return string`, done => {
    const res = main()
    expect(res).to.be.a('string')
    done()
  })
})
