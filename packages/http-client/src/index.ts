import Client from '@blued-core/client'
import request, { RequestPromiseOptions } from 'request-promise-native'
import { DataRequestError } from './error'
import { getRandomRequestId } from './util'
import buildPath, { removeBorderSlash } from './url-util'

type Config = RequestPromiseOptions & { url: string, requestId?: string }

const data = filterResults('data')
const accessMethod = ['get', 'post', 'put', 'delete']

export default class HttpClient extends Client<Request, string> {
  buildClient (key: string) {
    const client = new Request(() => this.conf.get(key))

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

  constructor(private getHost: () => string) {
    accessMethod.forEach((method: 'get' | 'post' | 'put' | 'delete') => {
      this[method] = (config: Config) => this.req({
        ...config,
        method: method.toUpperCase(),
      });
      (this as any)[`${method}Data`] = data(this[method])
    })
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
    try {
      const host = this.getHost()
      const results = await request({
        baseUrl: buildPath(host),
        url: removeBorderSlash(url),
        headers: {
          ...headers,
          'X-Request-ID': requestId,
        },
        json: true,
        ...config,
      })

      if (results.code === 200) {
        return results
      }

      throw new DataRequestError(requestId, `url:[${url}] code:[${results.code}] message:[${results.message}]`)
    } catch (e) {
      throw new DataRequestError(requestId, `url:[${url}] message:[${e.message}]`)
    }
  }
}

function filterResults (key: string) {
  return (func: (config: any) => Record<string, any>) => async (config: any) => {
    const res = await func(config)

    return res[key]
  }
}
