import { Sequelize } from 'sequelize-typescript'
import Client from '@blued-core/client'
import { MysqlConfItem, MysqlConfInstance } from '@blued-core/mysql-conf'

interface SequelizeConfig {
  masterHost: string
  username: string
  password: string
  database: string
  modelPath?: string
  slaveHost?: string[]
  isLocal?: boolean
}

export default class MysqlClient extends Client<Sequelize, MysqlConfInstance, MysqlConfItem> {
  buildClient (key: string) {
    const {
      masterHost,
      slaveHost,
      username,
      password,
      database,
      modelPath,
    } = this.conf.get(key)

    const client = createSequelize({
      masterHost,
      slaveHost,
      username,
      password,
      database,
      modelPath,
      isLocal: this.isLocal,
    })

    return {
      client,
      clean () {
        client.close()
      },
    }
  }
}

/**
 * 创建promisify版本的mysql连接
 * @param {MysqlClientConfig}
 */
export function createSequelize ({
  masterHost,
  slaveHost,
  username,
  password,
  database,
  modelPath = '',
  isLocal = false,
}: SequelizeConfig) {
  const authConfig = {
    host: masterHost,
    username,
    password,
  }

  const sequelize = new Sequelize({
    // 如果存在从库引用，则改为主从启动方式
    replication: {
      read: slaveHost.map(host => ({
        host,
        username,
        password,
      })),
      write: authConfig,
    },
    database,
    dialect: 'mysql',
    modelPaths: [modelPath],
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    operatorsAliases: false,
    // 本地环境输出生成后的SQL语句
    logging: isLocal && console.log,
  } as any)
  //    ^ as any 是因为 sequelize-typescript 没有实现 replication 相关的东西
  // 这个影响仅仅是在编译期，所以 TS 会报错，使用 any 忽略它（代码运行不会出问题）

  return sequelize
}