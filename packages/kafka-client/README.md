基于 kafka-node 的一层封装。

```bash
npm i @blued-core/kafka-client
```

> cache 与 qconf-conf 组件都为可选的，可以自己根据描述自定义

使用方式：

```typescript
import KafkaClient from '@blued-core/kafka-client'
import { QconfConf } from '@blued-core/qconf-conf'
import Cache from '@blued-core/cache'

async function main () {
  const qconfConf = new QconfConf({
    path: 'XXXX'
  })

  const kafkaClient = new KafkaClient(qconfConf, new Cache())

  const bootstrapKafka = kafkaClient.getClient('path')

  bootstrapKafka.send('topics', 'Hello World')
}

main()
```

### API

#### send

参数|类型|是否必填|描述
:--|:--|:--|:--
topic|`string`|✅|消息对应的 topic
message|`string`|✅|消息体
options|`Object`|❌|发送消息时的部分参数

##### options 结构描述

参数|类型|描述
:--|:--|:--
key|`string`|__only needed when using keyed partitioner__
partition|`number`|写入的分区
attributes|`number`|