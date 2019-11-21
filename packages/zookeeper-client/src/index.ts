import zookeeper from 'node-zookeeper-client'
import Client from '@blued-core/client'

export interface ZookeeperClient {
  getData: (path: string) => Promise<string>
  getChildren: (path: string) => Promise<string[]>
  setData: (path: string, value: string | number) => Promise<void>
  create: (path: string, value: string | number) => Promise<void>
  remove: (path: string) => Promise<void>
  exists: (path: string) => Promise<boolean>
  mkdirp: (path: string) => Promise<string>
}

enum TaskType {
  GetData,
  GetChildren,
  SetData,
  Create,
  Remove,
  Exists,
  Mkdirp
}

export type TaskItem = {
  resolve: Function
  reject: Function
  path: string
} & ({
  type: TaskType.GetData | TaskType.GetChildren | TaskType.Remove | TaskType.Exists | TaskType.Mkdirp
} | {
  type: TaskType.SetData | TaskType.Create
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
      create: (path: string, value: string | number) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.Create, value })
        } else {
          client.create(path, Buffer.from(String(value)), error => {
            if (error) return reject(error)

            resolve()
          })
        }
      }),
      remove: (path: string) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.Remove })
        } else {
          client.remove(path, error => {
            if (error) return reject(error)

            resolve()
          })
        }
      }),
      exists: (path: string) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.Exists })
        } else {
          client.exists(path, (error, stat) => {
            if (error) return reject(error)

            resolve(!!stat)
          })
        }
      }),
      mkdirp: (path: string) => new Promise((resolve, reject) => {
        if (!init) {
          buffer.push({ resolve, reject, path, type: TaskType.Mkdirp })
        } else {
          client.mkdirp(path, (error, path) => {
            if (error) return reject(error)

            resolve(path)
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
            case TaskType.Create:
              return taskItem.resolve(await clientUtil.create(taskItem.path, taskItem.value))
            case TaskType.Remove:
              return taskItem.resolve(await clientUtil.remove(taskItem.path))
            case TaskType.Exists:
              return taskItem.resolve(await clientUtil.exists(taskItem.path))
            case TaskType.Mkdirp:
              return taskItem.resolve(await clientUtil.mkdirp(taskItem.path))
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
