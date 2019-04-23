import Raven from 'raven'
import Client from '@blued-core/client'

export default class A extends Client<typeof Raven, string, {
  qconf: string
} | string> {
  buildClient (key: string) {
    const conf = this.conf.get(key)
    Raven.config(!this.isLocal && conf).install()
    Raven.disableConsoleAlerts()
    return {
      client: Raven,
      clean () {},
    }
  }
}
