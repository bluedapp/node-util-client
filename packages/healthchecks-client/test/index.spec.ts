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
    await wrapper(test, 'test')()
  } catch (e) {
    console.error('error', e)
  }
})()
