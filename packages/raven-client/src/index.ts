import Raven from 'raven'
import Client from '@blued-core/client'
import { NormalConf } from '@blued-core/normal-conf'

export default class extends Client<typeof Raven> {
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
