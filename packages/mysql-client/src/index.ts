import { Sequelize } from 'sequelize-typescript'
import sequelize from 'sequelize'
import Client from '@blued-core/client'

const { QueryTypes } = sequelize

export interface SequelizeConfig {
  master: {
    host: string
    port: string
  }
  slaves?: {
    host: string
    port: string
  }[]
  username: string
  password: string
  database: string
  modelPath?: string
  isLocal?: boolean
  timezone?: string
  maxPoolCount?: number
}

export interface MysqlConfInstance {
  master: {
    host: string
    port: string
  }
  slaves: {
    host: string
    port: string
  }[]
  username: string
  password: string
  database: any
  modelPath: any
  timezone?: string
  maxPoolCount?: number
}

export { Sequelize, sequelize, QueryTypes }

export type Mysql = Sequelize & {
  query (sql: string, options?: sequelize.QueryOptions): Promise<any>
  close (): void
}

export default class MysqlClient extends Client<Mysql, MysqlConfInstance> {
  buildClient (key: string) {
    const {
      master,
      slaves,
      username,
      password,
      database,
      modelPath,
      timezone = '+08:00',
      maxPoolCount = 5,
    } = this.conf.get(key)

    const client = createSequelize({
      master,
      slaves,
      username,
      password,
      database,
      modelPath,
      timezone,
      maxPoolCount,
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
  master,
  slaves,
  username,
  password,
  database,
  modelPath = '',
  timezone,
  isLocal = false,
  maxPoolCount = 5,
}: SequelizeConfig) {
  const authConfig = {
    host: master.host,
    port: master.port,
    username,
    password,
  }

  const sequelize = new Sequelize({
    // 如果存在从库引用，则改为主从启动方式
    replication: {
      read: slaves.map(({ host, port }) => ({
        host,
        port,
        username,
        password,
      })),
      write: authConfig,
    },
    database,
    timezone,
    dialect: 'mysql',
    modelPaths: [modelPath],
    pool: {
      max: maxPoolCount,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // operatorsAliases: false,
    // 本地环境输出生成后的SQL语句
    logging: isLocal && console.log,
  } as any)
  //    ^ as any 是因为 sequelize-typescript 没有实现 replication 相关的东西
  // 这个影响仅仅是在编译期，所以 TS 会报错，使用 any 忽略它（代码运行不会出问题）

  return sequelize as Mysql
}
