import zookeeper from 'node-zookeeper-client'
import Client from '@blued-core/client'

export interface ZookeeperClient {
  getData: (path: string) => Promise<string>
  getChildren: (path: string) => Promise<string[]>
  setData: (path: string, value: string | number) => Promise<void>
}

enum TaskType {
  GetData,
  GetChildren,
  SetData,
}

export type TaskItem = {
  resolve: Function
  reject: Function
  path: string
} & ({
  type: TaskType.GetData | TaskType.GetChildren
} | {
  type: TaskType.SetData
  value: string | number
})

export default class ExceptionReportClient extends Client<ZookeeperClient, string> {
  buildClient (key: string) {
    const conf = this.conf.get(key)
    const client = zookeeper.createClient(conf)

    const buffer: TaskItem[] = []
    let init = false
    let closeBuffer = false

    client.connect()

    const clientUtil: ZookeeperClient = {
      getData: (path: string) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.GetData })
        } else {
          client.getData(path, (error, data) => {
            if (error) return reject(error)

            resolve(data.toString())
          })
        }
      }),
      getChildren: (path: string) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.GetChildren })
        } else {
          client.getChildren(path, (error, data) => {
            if (error) return reject(error)

            resolve((data.toString() || '').split(','))
          })
        }
      }),
      setData: (path: string, value: string | number) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.SetData, value })
        } else {
          client.setData(path, Buffer.from(String(value)), error => {
            if (error) return reject(error)

            resolve()
          })
        }
      }),
    }

    client.once('connected', () => {
      init = true

      // connected after close
      if (closeBuffer) {
        client.close()
      }

      // send request when connected
      if (buffer.length) {
        buffer.forEach(async taskItem => {
          try {
            const { type } = taskItem
            switch (taskItem.type) {
            case TaskType.GetData:
              return taskItem.resolve(await clientUtil.getData(taskItem.path))
            case TaskType.GetChildren:
              return taskItem.resolve(await clientUtil.getChildren(taskItem.path))
            case TaskType.SetData:
              return taskItem.resolve(await clientUtil.setData(taskItem.path, taskItem.value))
            default: throw new Error(`invalid case: ${type}`)
            }
          } catch (e) {
            taskItem.reject(e)
          }
        })

        buffer.length = 0
      }
    })

    return {
      client: clientUtil,
      clean () {
        if (init) {
          client.close()
        } else {
          closeBuffer = true
        }
      },
    }
  }
}
