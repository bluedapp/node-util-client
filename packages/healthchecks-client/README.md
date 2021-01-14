## healthchecks-client


### 示例
```
import { createWrapper, PingClientConfig } from '../src/index'

const config: PingClientConfig = {
  baseURL: '/healthchecks/host',
  checks: {
    test: '/healthchecks/test',
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const test = async () => {
  console.log('test start')
  await sleep(1000)
  console.log('test end')
}

(async function main() {
  try {
    const wrapper = createWrapper(config)
    // 第二个参数必须是配置项 checks 中的 key
    await wrapper(test, 'test')()
  } catch (e) {
    console.error('error', e)
  }
})()

// 定时任务中使用
import { scheduleJob } from 'node-schedule'

scheduleJob('1 0 0 * * *', wrapper(test, 'test'))
```

