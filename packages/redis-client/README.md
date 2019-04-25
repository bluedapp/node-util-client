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
  const redisClient = new RedisClient(redisConf, new Cache())

  const redis1 = redisClient.getClient('redis1')
  const redis2 = redisClient.getClient('redis2')

  console.log(await redis1.hmget(`hashkey`, 'field1', 'field2'))

  console.log(await redis2.zscore(`zsetkey`, 'values'))
}

main()

```
