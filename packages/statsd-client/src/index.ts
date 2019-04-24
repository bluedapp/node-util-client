import dgram from 'dgram'
import os from 'os'
import Client from '@blued-core/client'
import { PerformanceClientInstance, PerformanceClientIntl } from '@blued-core/client-intl'

const localIp = os.hostname().replace(/[-.]/g, '_')
export enum StatsdType {
  Counting = 'c',
  Timing = 'ms'
}

export interface ConfInstance {
  conf: string,
  port: number,
  group: string,
  project: string
}

export default class StatsdClient
  extends Client<PerformanceClientInstance, ConfInstance, ConfInstance>
  implements PerformanceClientIntl {
  buildClient (key: string) {
    const serverSocket = dgram.createSocket('udp4')
    const { conf, port, group, project } = this.conf.get(key)

    let client = {
      timer(path: string, val: number) {
        if (!this.dev) sendMessage(path, val, StatsdType.Timing)
      },
      counter(path: string, val: number = 1) {
        if (!this.dev) sendMessage(path, val, StatsdType.Counting)
      },
    }

    return {
      client,
      clean () {
        client = null
      },
    }

    function sendMessage (path: string, val: number, type: StatsdType) {
      const msg = Buffer.from(`${removeDot(group)}.${removeDot(project)}.${localIp}${translatePath(path)}:${val}|${type}`)
      serverSocket.send(msg, port, conf)
    }
  }
}

/**
 * 避免变量中存在 . 符号导致 statd 路径增长
 * @param str 进行转换的字符串
 */
function removeDot (str: string) {
  return str.replace(/\./g, '_')
}

/**
 * 将路径转换为 stats 中可以进行分割的字符串 a/b/c -> a.b.c
 * @param str 进行转换的字符串
 */
function translatePath (str: string) {
  return str.replace(/\//g, '.')
}
