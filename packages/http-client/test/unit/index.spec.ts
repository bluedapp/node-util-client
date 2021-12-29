/* eslint-disable import/no-extraneous-dependencies */
import { describe } from 'mocha'
import { expect } from 'chai'
import { QconfHost } from '@blued-core/qconf-conf'
import HttpClient from '../../src/index'

describe('normal', () => {
  it(`get`, async () => {
    const client = new HttpClient(new QconfHost({
      key: '/blued/service/live/oversea_tools_host',
    }), new Map())

    const request = client.getClient('key')

    // request.

    const res1 = await request.get({
      url: '/level',
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

  it(`interceptors`, async () => {
    const client = new HttpClient(new QconfHost({
      key: '/blued/service/live/oversea_tools_host',
    }), new Map())

    client.interceptors.request.use((config: any) => {
      expect(config).to.be.an('object')
      return config
    })

    client.interceptors.response.use((res: any) => {
      expect(res).to.be.an('object')
      return res
    })
    const request = client.getClient('key')

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
