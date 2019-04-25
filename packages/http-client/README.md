基于 request 的一层封装。

```bash
npm i @blued-core/http-client
```

> cache 与 qconf-conf 组件都为可选的，可以自己根据描述自定义

使用方式：

```typescript
import HttpClient from '@blued-core/http-client'
import Cache from '@blued-core/cache'
import { QconfHost } from '@blued-core/qconf-conf'

const qconfConf = new QconfHost({
  host1: 'XXX'
})

// Cache 可以使用 Map 代替
const httpClient = new HttpClient(qconfConf, new Cache())

const httpClient1 = httpClient.getClient('host1')

async function main () {
  const res = await httpClient1.getData({
    url: 'path1/path2',
    qs: { id: 1 }
  })

  console.log(res)
}

main()
```

### API

调用参数与`request`参数一致，提供如下八个方法：

基于`method`抽出来的四个方法：`get`、`post`、`put`、`delete`。  
基于以上四个方法的基础上处理返回值的四个方法：`getData`、`postData`、`putData`、`deleteData`。  

#### 两者的区别

```typescript
httpClient.get({
  url: 'XXX'
}) // => { code: 200, data: 'Hello World' }

httpClient.getData({
  url: 'XXX'
}) // => 'Hello World'
```