import { promisify } from 'util'
import redis from 'redis'
import { list } from 'redis-commands'
import Client from '@blued-core/client'
import { RedisPromisifyClient } from './types/redis-fixer'

export interface RedisConfInstance {
  host: string
  port: string | number
}

export default class RedisClient extends Client<RedisPromisifyClient, RedisConfInstance> {
  buildClient (key: string) {
    const { host, port } = this.conf.get(key)

    // 增加回调方法
    let cb = () => {}
    if (this.option.cb && typeof this.option.cb === 'function') {
      ({ cb } = this.option)
    }

    const client = createRedisClient(host, Number(port), cb)

    return {
      client,
      clean () {
        client.quit()
      },
    }
  }
}

/**
 * 创建redis客户端连接
 * @param {string} host redis对应的IP
 * @param {number} port 创建链接的端口
 * @return {RedisClient}
 */
function createRedisClient (host: string, port = 6379, cb: Function) {
  const redisClient = redis.createClient(port, host)

  // build promisify methods
  const redisPromisifyClient = build(redisClient, cb)

  return redisPromisifyClient
}

/**
 * 将 Redis 命令转换为 Promise 版本
 * @param {any} target RedisClient
 * @return {any}
 */
function build (target: any, cb: Function): RedisPromisifyClient {
  list.forEach((method: any) => {
    const func = target[method]
    if (typeof func === 'function') {
      const promisifyFn = promisify(func).bind(target)
      if (['multi'].includes(method)) {
        target[method] = recordMultiDecorator(func.bind(target), cb)
        target[method.toUpperCase()] = recordMultiDecorator(func.bind(target), cb)
      } else if (['info', 'quit'].includes(method)) {
        target[method] = promisifyFn
        target[method.toUpperCase()] = promisifyFn
      } else {
        target[method] = recordDecorator(promisifyFn, cb)
        target[method.toUpperCase()] = recordDecorator(promisifyFn, cb)
      }
    }
  })

  return target
}

/**
 * 使用高阶函数装饰函数
 * @param {function} 原函数
 * @returns {any}
 */
function recordDecorator(wrapped: Function, cb: Function) {
  return async (...args: any[]) => {
    const name = wrapped.name.replace('bound ', '')
    const result = await wrapped(...args)
    cb(name, args, result)
    return result
  }
}

function recordMultiDecorator(wrapped: Function, cb: Function) {
  return (...args: any[]) => {
    const name = wrapped.name.replace('bound ', '')
    cb(name, args)
    return wrapped(...args)
  }
}
