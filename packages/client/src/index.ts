import ConfIntl from '@blued-core/conf-intl'
import CacheIntl from '@blued-core/cache-intl'

const suggestInstanceCount = 3

export interface ClientIntl {
  clean (): void
}

export default abstract class Client<T extends ClientIntl> {
  conf: ConfIntl

  cache: CacheIntl

  constructor(protected interval = 1000, protected keepInstanceCount = suggestInstanceCount) {
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
      const client = this.buildClient(key)
      this.cache.set(key, client)

      // 在实例保存数量达到上限时清除当前引用的实例
      setTimeout(() => {
        client.clean()
      }, this.interval * this.keepInstanceCount)

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

  abstract buildClient (key: string): T

  abstract cleanClient (key: string): void
}