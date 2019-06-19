/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import { NormalConf } from '@blued-core/normal-conf'

import ZookeeperClient from '../../src'

const conf = new NormalConf({ conf: '127.0.0.1:2181' })

const zookeeperClient = new ZookeeperClient(conf, new Map())

const rootPath = '/backend'

async function main () {
  const client = zookeeperClient.getClient('conf')
  const child = await client.getChildren(rootPath)

  console.log(child)

  const datas = await Promise.all(child.map(childPath => client.getChildren(path.resolve(rootPath, childPath))))

  console.log(datas)

  const switchPath = '/serviceapple_switch'

  await client.setData(switchPath, 0)

  console.log(await client.getData(switchPath))
}

main()