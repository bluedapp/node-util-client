基于 mysql2 和 sequelize 的一层封装。

```bash
npm i @blued-core/mysql-client
```

API与 Sequelize 保持一致，内置定时更新 Client 之类的功能。  

使用方式：

> cache 与 mysql-conf 组件都为可选的，可以自己根据描述自定义

```typescript
import Cache from '@blued-core/cache'
import { MysqlConf } from '@blued-core/mysql-conf'
import MysqlClient, { QueryTypes } from '@blued-core/mysql-client'

const mysqlConf = new MysqlConf({
  mysql1: {
    qconf: 'XXX',
    database: 'XX database'
  }
})

async function main () {
  // 如不想安装 Cache ，则可使用 new Map() 代替
  const mysqlClient = new MysqlClient(mysqlConf, new Cache())

  const payMysql = mysqlClient.getClient('mysql1')

  const results = await payMysql.query(
    `SELECT col1, col2 FROM table LIMIT 10;`,
    { type: QueryTypes.SELECT }
  )
}

main()
```
