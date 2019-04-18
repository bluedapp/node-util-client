import Raven from 'raven'
import Client from '@blued-core/client'
import { NormalConf } from '@blued-core/normal-conf'

interface RavenClient { client: typeof Raven, clean: () => any }

export default class extends Client<RavenClient> {
  conf: NormalConf

  buildClient (key: string) {
    const conf = this.conf.get(key)
    Raven.config(!this.dev && conf).install()
    Raven.disableConsoleAlerts()
    return {
      client: Raven,
      clean () {},
    }
  }
}
