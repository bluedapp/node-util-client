import Raven from 'raven'
import Client from '@blued-core/client'
import { ErrorReportClientIntl } from '@blued-core/client-intl'

export default class RavenClient extends Client<typeof Raven, string, {
  qconf: string
} | string> implements ErrorReportClientIntl {
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
