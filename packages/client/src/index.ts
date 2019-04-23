import ConfIntl from '@blued-core/conf-intl'
import CacheIntl from '@blued-core/cache-intl'

const suggestInstanceCount = 3

export interface ClientResourceIntl<T = any> {
  client: T,
  clean (): void
}

export interface ClientIntl<T extends any = any> {
  conf: ConfIntl
  cache: CacheIntl
  interval?: number
  keepInstanceCount?: number
  isLocal?: boolean

  getClient (key: string, force?: boolean): T
  buildClient (key: string): ClientResourceIntl<T>
}

export default abstract class Client<
  T extends any = any,
  Type extends any = any,
  Item extends any = any
> implements ClientIntl<T> {
  constructor(
    public conf: ConfIntl<Type, Item>,
    public cache: CacheIntl<T>,
    public interval = 1000,
    public keepInstanceCount = suggestInstanceCount,
    public isLocal = false
  ) {
    if (keepInstanceCount < suggestInstanceCount) console.warn(`suggest: keep instance count larger than ${suggestInstanceCount}`)
  }

  /**
   * 获取 Client 实例
   * @param key 获取配置所需的标识
   * @param force 是否强制获取最新数据
   */
  getClient (key: string, force?: boolean): T {
    if (!force && this.cache.has(key)) {
      return this.cache.get(key)
    }

    try {
      const { client, clean } = this.buildClient(key)
      this.cache.set(key, client)

      // 在实例保存数量达到上限时清除当前引用的实例
      setTimeout(clean, this.interval * this.keepInstanceCount)

      return client
    } catch (e) {
      return this.cache.get(key)
    } finally {
      // 定时更新新的实例
      setTimeout(() => {
        this.getClient(key, true)
      }, this.interval)
    }
  }

  abstract buildClient (key: string): ClientResourceIntl<T>
}