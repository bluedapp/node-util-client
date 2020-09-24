import Client from '@blued-core/client'
import HttpAgent from 'agentkeepalive'
import axios from 'axios'
import InterceptorManager, { IThenParams } from './interceptor-manager'
import { DataRequestError } from './error'
import { getRandomRequestId } from './util'
import buildPath, { removeBorderSlash } from './url-util'

export interface Config {
   url: string,
   requestId?: string,
   headers?: { [key: string]: string},
   [key: string]: any
}

const { HttpsAgent } = HttpAgent
const data = filterResults('data')
const accessMethod = ['get', 'post', 'put', 'delete']
export default class HttpClient extends Client<Request, string> {
  interceptors: {
    request: InterceptorManager
    response: InterceptorManager
  } = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  }

  buildClient (key: string) {
    const client = new Request(() => {
      const host = this.conf.get(key)
      if (!host) throw new Error(`conf key(${key}) 无法获取对应host`)

      return host
    }, this.interceptors)

    return {
      client,
      clean () {},
    }
  }
}

export class Request {
  /**
   * get 请求
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await get({ url: 'info/update', qs: { id: 123 } })
   */
  public get: (config: Config) => Promise<any>

  /**
   * post 请求
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await post({ url: 'info/update', body: { id: 123 } })
   */
  public post: (config: Config) => Promise<any>

  /**
   * put 请求
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await put({ url: 'info/update', qs: { id: 123 } })
   */
  public put: (config: Config) => Promise<any>

  /**
   * delete 请求
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await delete({ url: 'info/update', body: { id: 123 } })
   */
  public delete: (config: Config) => Promise<any>

  /**
   * get 请求，直接返回 body
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await getData({ url: 'info/update', qs: { id: 123 } })
   */
  public getData: (config: Config) => Promise<any>

  /**
   * post 请求，直接返回 body
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await postData({ url: 'info/update', body: { id: 123 } })
   */
  public postData: (config: Config) => Promise<any>

  /**
   * put 请求，直接返回 body
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await putData({ url: 'info/update', body: { id: 123 } })
   */
  public putData: (config: Config) => Promise<any>

  /**
   * delete 请求，直接返回 body
   * @param {string} uri    请求的相对路径
   * @param {object} config 剩余的参数
   * @example await deleteData({ url: 'info/update', body: { id: 123 } })
   */
  public deleteData: (config: Config) => Promise<any>

  constructor(
    private getHost: () => string,
    private interceptors: {
      request: InterceptorManager
      response: InterceptorManager
    },
  ) {
    accessMethod.forEach((method: 'get' | 'post' | 'put' | 'delete') => {
      this[method] = (config: Config) => this.superReq({
        ...config,
        method: method.toUpperCase(),
      });
      (this as any)[`${method}Data`] = data(this[method])
    })
  }

  /**
   * request lifecycle
   * promise chain  | ...requestInterceptors -> req -> ...responseInterceptors |
   */
  private superReq (config: Config) {
    const chain: [any, any] = [this.req.bind(this), undefined]
    let promise = Promise.resolve(config)

    this.interceptors.request.forEach((interceptor: IThenParams) => {
      chain.unshift(interceptor.fulfilled, interceptor.rejected)
    })

    this.interceptors.response.forEach((interceptor: IThenParams) => {
      chain.push(interceptor.fulfilled, interceptor.rejected)
    })

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }

    return promise
  }

  /**
   * live-data 请求的 base 版本
   * @example await req({ url: 'info/update', qs: { id: 123 }, method: 'GET' })
   */
  private async req ({
    url,
    headers,
    requestId = getRandomRequestId(),
    ...config
  }: Config) {
    const host = this.getHost()

    try {
      let params = {}
      let data = {}
      if (config.qs) {
        params = config.qs
        delete config.qs
      }
      if (config.body) {
        data = config.body
        delete config.body
      }

      const results = await axios.request({
        url: removeBorderSlash(url),
        baseURL: buildPath(host),
        headers: {
          ...headers,
          'X-Request-ID': requestId,
        },
        httpAgent: new HttpAgent({ keepAlive: true }),
        httpsAgent: new HttpsAgent({ keepAlive: true }),
        params,
        data,
        ...config,
      })

      return results.data
    } catch (e) {
      if (e.requestId) {
        throw e
      } else {
        throw new DataRequestError(
          requestId,
          e.error,
          e.statusCode,
          e.error ? e.error.code : 500,
          `url:[${url}] message:[${e.message}]`,
        )
      }
    }
  }
}

function filterResults (key: string) {
  return (func: (config: any) => Record<string, any>) => async (config: any) => {
    const res = await func(config)

    return res[key]
  }
}
