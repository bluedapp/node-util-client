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
        beforeSend: (e, hint) => {
          const error = hint.originalException || e
          if (EventCache.has(error)) {
            return EventCache.get(error) <= 0 ? e : null
          } else {
            EventCache.set(error, ExpireSecond)
            return e
          }
        },
        ...this.option,
      })

      // 处理缓存错误的有效期
      setInterval(() => {
        EventCache.forEach((v, k) => {
          if (v <= 0) {
            EventCache.delete(k)
          } else {
            EventCache.set(k, v - LoopSecond)
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
