import ConfIntl from '@blued-core/conf-intl'
import CacheIntl from '@blued-core/cache-intl'
import { ClientIntl, ClientResourceIntl } from '@blued-core/client-intl'

const suggestInstanceCount = 3

export default abstract class Client<
  // client 返回的类型
  T extends any = any,
  // client 创建所需配置返回的数据结构，同时也是缓存存储的类型
  Type extends any = any
> implements ClientIntl<T> {
  constructor(
    public conf: ConfIntl<Type>,
    public cache: CacheIntl<T>,
    public isLocal = false,
    public interval = 1000,
    public keepInstanceCount = suggestInstanceCount,
    public option = {}
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
