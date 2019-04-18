/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import { QconfHost } from '@blued-core/qconf-conf'
import HttpClient from '../../src/index'

describe('normal', () => {
  it(`function return string`, async () => {
    const client = new HttpClient(new QconfHost({
      key: '/blued/service/live/oversea_tools_host',
    }), new Map())

    const request = client.getClient('key')

    // request.

    const res1 = await request.get({
      url: '/level/',
      qs: {
        uid: 123,
      },
    })

    const res2 = await request.getData({
      url: '/level/',
      qs: {
        uid: 123,
      },
    })
    expect(res1).to.be.an('object')
    expect(res2).to.be.an('object')
  })
})
