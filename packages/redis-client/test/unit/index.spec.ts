import { RedisConf } from '@blued-core/redis-conf'
import { describe } from 'mocha'
import { expect } from 'chai'
import RedisClient from '../..'

const redisConf = new RedisConf({ key: '/blued/backend/umem/live' })
// const client = new RedisClient(redisConf, new Map(), true, 1000, 3, { cb: console.error })
const client = new RedisClient(redisConf, new Map())
const redisClient = () => client.getClient('key')

describe('normal', () => {
  it(`get`, async () => {
    const a = await redisClient().type('a')
    console.log({ a })
    await redisClient().set('a', 11)
    const b = await redisClient().get('a')
    console.log({ b })

    const c = redisClient().multi([['get', 'a'], ['get', 'b'], ['del', 'a']])
      .exec((err, replies) => console.log(err, replies))
    console.log(c)

    expect(b).equal('11')
  })
})
