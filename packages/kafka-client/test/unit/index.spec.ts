/* eslint-disable */
import { it } from 'mocha'
import { expect } from 'chai'
import { QconfConf } from '@blued-core/qconf-conf'
import KafkaClient from '../../src'

const conf = new QconfConf({
  a: 'xxx',
})

const kafkaClient = new KafkaClient(conf, new Map())
const aKafkaClient = () => kafkaClient.getClient('a')

const randomId = () => (Math.random() * 1e6).toString(32)

describe('kafka', () => {
  it('log', () => {
    const rid = randomId()
    console.log(aKafkaClient())
    aKafkaClient().send('test-001', `text-${rid}`)
    console.log(`send message: ${rid}`)
    expect(rid).to.be.string
  })
})
