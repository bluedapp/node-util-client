import kafka, { Producer } from 'kafka-node'
import Client from '@blued-core/client'

export default class KafkaClient extends Client {
  buildClient(key: string) {
    const confStr = this.conf.get(key)
    const client = new kafka.Client(confStr)
    const producer = new Producer(client)

    return {
      client: {
        send (topic: string, messages: string, {
          key = '',
          partition = 0,
          attributes = 2,
        }: {
          key: string,
          partition: number,
          attributes: number
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