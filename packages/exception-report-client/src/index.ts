import * as Sentry from '@sentry/node'
import Client from '@blued-core/client'
import { ExceptionReportClientIntl } from '@blued-core/client-intl'

let flag = true
const EventCache = new Map()
const LoopSecond = 10
const ExpireSecond = 60

export default class ExceptionReportClient extends Client<typeof Sentry, string> implements ExceptionReportClientIntl {
  buildClient (key: string) {
    if (flag) {
      flag = false
      const conf = this.conf.get(key)
      Sentry.init({
        dsn: !this.isLocal && conf,
        debug: this.isLocal,
        beforeSend: (e, hints) => {
          const error = getErrorKey(hints.originalException)
          if (EventCache.has(error) && Date.now() - EventCache.get(error) < ExpireSecond * 1e3) {
            return null
          } else {
            EventCache.set(error, Date.now())
            return e
          }
        },
        ...this.option,
      })

      // 处理缓存错误的有效期
      setInterval(() => {
        EventCache.forEach((v, k) => {
          if (Date.now() - v >= ExpireSecond * 1e3) {
            EventCache.delete(k)
          }
        })
      }, LoopSecond * 1e3)
    }

    return {
      client: Sentry,
      clean () { },
    }
  }
}

function getErrorKey (e: string|Error) {
  return typeof e === 'string' ? e : [e.name, e.message, e.stack].join(' ')
}
