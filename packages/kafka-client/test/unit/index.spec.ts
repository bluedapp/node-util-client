/* eslint-disable import/no-extraneous-dependencies */

import { NormalConf } from '@blued-core/normal-conf'
import KafkaClient from '../../src'

const conf = new NormalConf({
  test: 'xxx',
})

const kafkaClient = new KafkaClient(conf, new Map())

const randomId = () => (Math.random() * 1e6).toString(32)

setInterval(() => {
  const rid = randomId()
  kafkaClient.getClient('test').send('live-log', `text-${rid}`)
  console.log(`send message: ${rid}`)
}, 500)

