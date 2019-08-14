
import Client from '@blued-core/client'
import { Client as BaseClient } from '@elastic/elasticsearch'

export * from '@elastic/elasticsearch'

export default class ElasticsearchClient extends Client<BaseClient, string> {
  buildClient(key: string) {
    const host = this.conf.get(key)

    const client = createElasticsearchClient(host)

    return {
      client,
      clean () {
        client.close()
      },
    }
  }
}

function createElasticsearchClient (host: string) {
  return new BaseClient({ node: `http://${host}` })
}