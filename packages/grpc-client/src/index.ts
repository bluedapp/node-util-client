import * as grpc from 'grpc'
import * as protobuf from 'protobufjs'
import { Any } from 'google-protobuf/google/protobuf/any_pb'
import { QconfConf } from '@blued-core/qconf-conf'
import Client from '@blued-core/client'
import { promisify } from 'util'

export class GrpcReportClient extends Client {
  public host: string
  public protoPath: Record<string, any>
  constructor ({
    protoPath,
    host,
    interval = 100000
  }: {
      protoPath: {
        request: string,
        [key: string]: string
      },
      host: string,
      interval?: number
    }) {
    super(
      new QconfConf(protoPath),
      new Map(),
      true,
      interval
    )
    this.host = host
    this.protoPath = protoPath
  }

  getClient(): {
    report<T>(arg: T): any
  } {
    return super.getClient('any', false)
  }

  buildClient() {
    try {
      const requestType = this.conf.get('request')
      if (!requestType) throw new Error('proto error')
      const [
        ,
        requestPackage,
        serviceType,
        method,
        reqType,
      ] = /package\s(.+?);[\s\S]+service\s+?(.+?)\s*\{[\s\S]*?rpc\s+(.+?)\s+\((.+?)\)/g.exec(requestType) || <any>[]
      if (!requestPackage || !serviceType || !method || !reqType) throw new Error('proto error')

      const requestPath = `${requestPackage}.${reqType}`

      const Request = protobuf.parse(requestType).root.lookupType(requestPath)
      const RequestJSON = Request.toJSON()
      const customProps: { [key: string]: any } = {}
      for (const prop in RequestJSON.fields) {
        if (this.protoPath[prop]) {
          const customType = this.conf.get(prop)
          const [
            ,
            customPackage,
            protoName,
          ] = /package\s(.+?);[\s\S]+?message\s+(.+?)\s*\{/.exec(customType) || <any>[]
          const protoPath = `${customPackage}.${protoName}`
          const proto = protobuf.parse(customType).root.lookupType(protoPath)
          customProps[prop] = RequestJSON.fields[prop].type === 'google.protobuf.Any' ? (obj: { [key: string]: any }) => {

            const buffer = proto.encode(proto.create(obj)).finish()
            const any = new Any()
            if (buffer.length) any.pack(buffer, protoPath)
            return any.serializeBinary()

          } : (obj: { [key: string]: any }) => {
            const buffer = proto.encode(proto.create(obj)).finish()
            return new Uint8Array(buffer)
          }
          Request.fields[prop].type = 'bytes'
        }
      }
      const methodPath = `/${requestPackage}.${serviceType}/${method}`
      const reportClient = new grpc.Client(this.host, grpc.credentials.createInsecure())
      return {
        client: {
          report: async (arg: { [key: string]: any }) => {

            for (const key in customProps) {
              if (arg[key]) {
                arg[key] = customProps[key](arg[key] || {})
              }
            }
            const request = Request.encode(
              Request.create(arg)
            ).finish()
            return promisify(
              (fn: Function) => {
                const stream = (<any>reportClient.makeClientStreamRequest)(
                  methodPath,
                  null,
                  (arg: any) => arg,
                  fn
                )
                stream.write(Buffer.from(request))
                stream.end()
              }
            )()
          },
        },
        clean() {
          reportClient.close()
        },
      }
    } catch (e) {
      console.error(e)
      return {
        client: { report: async () => { throw new Error('build client error') } },
        clean() { }
      }
    }
  }
}
