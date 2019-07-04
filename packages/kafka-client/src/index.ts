import { Client as BaseClient, Producer as BaseProducer } from 'kafka-node'
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

let clientStatus = false
const messageBuffer: Payloads[] = []
let client: BaseClient | null = null
let producer: BaseProducer | null = null

export default class KafkaClient extends Client<Kafka, string> {
  buildClient(key: string) {
    const confStr = this.conf.get(key)

    if (client === null) {
      client = new BaseClient(confStr)
    }
    if (producer === null) {
      producer = new BaseProducer(client)
    }

    // only listen event when client not ready
    if (!clientStatus) {
      const readyEventHandler = () => {
        if (!clientStatus) {
          clientStatus = true

          if (messageBuffer.length > 0) {
            if (producer === null) return

            messageBuffer.forEach(message => {
              producer.send([message], (error: Error) => {
                if (error) console.error(error)
              })
            })

            // clean buffer when send message complete
            messageBuffer.length = 0
          }
        }
      }

      producer.on('ready', readyEventHandler)
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
          if (clientStatus) {
            producer.send([payloads], (error: Error) => {
              if (error) console.error(error)
            })
          } else {
            messageBuffer.push(payloads)
          }
        },
      },
      clean () {
        // force clean buffer when rebuild client
        if (!clientStatus && messageBuffer.length > 0) {
          messageBuffer.length = 0
        }
        // producer.close()
        // client.close()
      },
    }
  }
}