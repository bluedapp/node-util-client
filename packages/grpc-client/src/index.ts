import * as grpc from 'grpc'
import * as protobuf from 'protobufjs'
import { Any } from 'google-protobuf/google/protobuf/any_pb'
import { QconfConf } from '@blued-core/qconf-conf'
import Client from '@blued-core/client'
import { promisify } from 'util'

export class GrpcReportClient extends Client {
  public host: string

  constructor({
    request,
    extra,
    host,
  }: {
    request: string,
    extra: string,
    host: string
  }) {
    super(
      new QconfConf({
        request,
        extra,
      }),
      new Map(),
      true,
      100000
    )
    this.host = host
  }

  getClient(key: string, force?: boolean): {
    report<R extends any,T extends any>(arg:{
      extra?:T,
    } & R): any
  } {
    return super.getClient(key, force)
  }

  buildClient() {
    const requestType = this.conf.get('request')
    const extraType = this.conf.get('extra')
    if (!requestType || !extraType) throw new Error('proto error')

    const [
      ,
      requestPackage,
      serviceType,
      method,
      reqType,
    ] = /package\s(.+?);[\s\S]+service\s+?(.+?)\s*\{[\s\S]*?rpc\s+(.+?)\s+\((.+?)\)/g.exec(requestType) || <any>[]
    const [
      ,
      extraPackage,
      extraProto,
    ] = /package\s(.+?);[\s\S]+?message\s+(.+?)\s*\{/.exec(extraType) || <any>[]
    if (!requestPackage || !serviceType || !method || !reqType || !extraPackage || !extraProto) throw new Error('proto error')

    const extraProtoPath = `${extraPackage}.${extraProto}`
    const methodPath = `/${requestPackage}.${serviceType}/${method}`
    const requestPath = `${requestPackage}.${reqType}`
    const Extra = protobuf.parse(extraType).root.lookupType(extraProtoPath)
    const Request = protobuf.parse(requestType).root.lookupType(requestPath)

    Request.fields.extra.type = 'bytes'
    const reportClient = new grpc.Client(this.host, grpc.credentials.createInsecure())

    return {
      client: {
        report: (arg:any) => {
          const extraBuffer = Extra.encode(Extra.fromObject(arg.extra || {})).finish()
          const any = new Any()
          any.pack(extraBuffer, extraProtoPath)
          const request = Request.encode(
            Request.fromObject({
              ...<any>arg,
              extra: any.serializeBinary(),
            })
          ).finish()
          return promisify(
            (fn: Function) => {
              const stream = (<any>reportClient.makeClientStreamRequest)(
                methodPath,
                null,
                (arg: any) => arg,
                fn
              )
              stream.write(request)
              stream.end()
            }
          )()
        },
      },
      clean() {},
    }
  }
}
