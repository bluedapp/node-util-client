基于 redis 的一层封装。

```bash
npm i @blued-core/redis-client
```

API与 Redis 保持一致，内置定时更新 Client 之类的功能。

> cache 与 redis-conf 组件都为可选的，可以自己根据描述自定义

使用方式：

```typescript
import Cache from '@blued-core/cache'
import { RedisConf } from '@blued-core/redis-conf'
import RedisClient from '@blued-core/redis-client'

const redisConf = new RedisConf({
  redis1: 'XXX',
  redis2: 'XXX',
})

async function main () {
  // 如不想使用 Cache 则可以使用 Map 代替
  // v0.2.0 支持回调方法，通过第6个参数传递 cb 方法, 下面传递了 console.log
  // 调用 cb 时的参数是 (command: string, args: (string|number)[], result: any)
  const redisClient = new RedisClient(redisConf, new Cache(), true, 1000, 3, { cb: console.log })

  const redis1 = () => redisClient.getClient('redis1')
  const redis2 = () => redisClient.getClient('redis2')

  // cb示例: cb('set', [ 'a', 11 ], 'OK')
  await redis1().set('a', 11)
  // cb示例: cb('get', [ 'a' ], '11')
  await redis1().get('a')

  console.log(await redis1().hmget(`hashkey`, 'field1', 'field2'))

  console.log(await redis2().zscore(`zsetkey`, 'values'))
}

main()

```
