import kafka, { Producer } from 'kafka-node'
import Client from '@blued-core/client'

export interface Kafka {
  send (topic: string, messages: string, otpions?: {
    key: string,
    partition: number,
    attributes: number
  }): void
}

export interface KafkaConfigs {
  key?: string
  partition?: number
  attributes?: number
}

const defaultKey = ''
const defaultPartition = 0
const defaultAttributes = 2

export default class KafkaClient extends Client<Kafka, string> {
  buildClient(key: string) {
    const confStr = this.conf.get(key)
    const client = new kafka.Client(confStr)
    const producer = new Producer(client)

    return {
      client: {
        send (topic: string, messages: string, {
          key = defaultKey,
          partition = defaultPartition,
          attributes = defaultAttributes,
        }: KafkaConfigs = {
          key: defaultKey,
          partition: defaultPartition,
          attributes: defaultAttributes,
        }) {
          const payloads = {
            topic,
            // multi messages should be a array, single message can be just a string or a KeyedMessage instance
            messages,
            // only needed when using keyed partitioner
            key,
            // default 0
            partition,
            // default: 0
            attributes,
          }
          if (producer) {
            producer.send([payloads], (error: Error) => {
              if (error) console.error(error)
            })
          }
        },
      },
      clean () {
        producer.close()
      },
    }
  }
}