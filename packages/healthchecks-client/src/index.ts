import { QconfConf, QconfConfItem } from '@blued-core/qconf-conf'
import axios from 'axios'

export class Ping {
  private timeout: number

  constructor(
    public getBaseURL?: () => string,
    public getCheckId?: () => string,
    timeout?: number,
  ) {
    this.timeout = timeout || 3000
  }

  setTimeout(timeout: number) {
    this.timeout = timeout || 3000
  }

  async request(signal: string | number, payload?: any) {
    const baseURL = this.getBaseURL ? this.getBaseURL() : null
    const checkId = this.getCheckId ? this.getCheckId() : null
    const path = checkId ? `ping/${checkId}` : null
    if (!baseURL || !path) {
      console.warn('[healthchecks-client] ping not avaliable.', { baseURL, path })
      return
    }
    const url = path + (Number.isInteger(signal) || signal ? `/${signal}` : '')
    try {
      let data = null
      if (typeof payload === 'string') {
        data = payload
      } else if (typeof payload === 'object') {
        data = JSON.stringify(payload)
      } else if (typeof payload === 'number') {
        data = String(payload)
      }
      if (data) {
        return await axios({ url, baseURL, method: 'post', timeout: this.timeout, data })
      } else {
        return await axios({ url, baseURL, method: 'get', timeout: this.timeout })
      }
    } catch (e) {
      console.warn(`[healthchecks-client] Ping ${url} error =>`, e.stack)
    }
  }

  ping(payload?: any) {
    return this.request('', payload)
  }

  start(payload?: any) {
    return this.request('start', payload)
  }

  fail(payload?: any) {
    return this.request('fail', payload)
  }

  exit(status: string | number, payload?: any) {
    return this.request(status, payload)
  }
}

export interface PingClientConfig {
  baseURL: QconfConfItem
  checks: Record<string, QconfConfItem>
}

export function createPingClient({
  baseURL,
  checks,
}: PingClientConfig) {
  const qconfs = new QconfConf(checks)
  const qhosts = new QconfConf({ baseURL })
  const clients: Record<string, Ping> = {}
  if (baseURL) {
    for (const key of Object.keys(checks)) {
      clients[key] = new Ping(() => qhosts.get('baseURL'), () => qconfs.get(key))
    }
  } else {
    for (const key of Object.keys(checks)) {
      clients[key] = new Ping()
    }
    console.warn('[healthchecks-client] baseURL not found.')
  }
  return clients
}

export function createWrapper(config: PingClientConfig) {
  const pingClient = createPingClient(config)
  return (func: Function, name: string, onlyPing?: boolean, timeout?: number) => async (): Promise<void> => {
    try {
      if (timeout) {
        pingClient[name].setTimeout(timeout)
      }
      if (onlyPing) {
        await pingClient[name].ping()
      } else {
        await pingClient[name].start()
      }
      await func()
      if (!onlyPing) {
        await pingClient[name].ping()
      }
    } catch (e) {
      await pingClient[name].fail({ code: e.code || 0, message: e.message, stack: e.stack })
    }
  }
}