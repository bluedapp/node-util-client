import { KafkaClient as BaseClient, Producer as BaseProducer } from 'kafka-node'
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

export interface Payloads {
  topic: string
  messages: string
  key: string
  partition: number
  attributes: number
}

const defaultKey = ''
const defaultPartition = 0
const defaultAttributes = 2

// support multiple kafka servers
const clientStatusObj: Record<string, boolean> = {}
const messageBufferObj: Record<string, Payloads[]> = {}
const clientObj: Record<string, BaseClient> = {}
const producerObj: Record<string, BaseProducer> = {}
const isNil = (value: any) => value === undefined || value === null

export default class KafkaClient extends Client<Kafka, string> {
  buildClient(kafkaKey: string) {
    if (isNil(clientStatusObj[kafkaKey])) clientStatusObj[kafkaKey] = false
    if (isNil(messageBufferObj[kafkaKey])) messageBufferObj[kafkaKey] = []

    if (isNil(clientObj[kafkaKey])) {
      const confStr = this.conf.get(kafkaKey)
      const kafkaHost = confStr.split(',').map(host => `${host}:9092`).join(',')
      clientObj[kafkaKey] = new BaseClient({ kafkaHost })
    }
    if (isNil(producerObj[kafkaKey])) {
      producerObj[kafkaKey] = new BaseProducer(clientObj[kafkaKey])
    }

    // only listen event when client not ready
    if (!clientStatusObj[kafkaKey]) {
      const readyEventHandler = () => {
        if (!clientStatusObj[kafkaKey]) {
          clientStatusObj[kafkaKey] = true

          if (messageBufferObj[kafkaKey].length > 0) {
            if (producerObj[kafkaKey] === null) return

            messageBufferObj[kafkaKey].forEach(message => {
              producerObj[kafkaKey].send([message], (error: Error) => {
                if (error) console.error(error)
              })
            })

            // clean buffer when send message complete
            messageBufferObj[kafkaKey].length = 0
          }
        }
      }

      producerObj[kafkaKey].on('ready', readyEventHandler)
    }

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
          const payloads: Payloads = {
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
          if (clientStatusObj[kafkaKey]) {
            producerObj[kafkaKey].send([payloads], (error: Error) => {
              if (error) console.error(error)
            })
          } else {
            messageBufferObj[kafkaKey].push(payloads)
          }
        },
      },
      clean () {
        // force clean buffer when rebuild client
        if (!clientStatusObj[kafkaKey] && messageBufferObj[kafkaKey].length > 0) {
          messageBufferObj[kafkaKey].length = 0
        }

        // producerObj[kafkaKey].close()
        // clientObj[KafkaKey].close()
      },
    }
  }
}
