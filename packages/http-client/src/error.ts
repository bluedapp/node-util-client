import { getRandomRequestId } from './util'

/**
 * 继承自 Error 的特殊对象，用于发送数据接口时错误捕获携带 requestId
 */
export class DataRequestError extends Error {
  /**
   * @param  {[string=getRandomRequestId()]}  requestId 唯一的RequestID
   * @param  {string}                         message   错误信息
   * @param  {...any}                         arg       普通Error调用时传递的参数
   */
  constructor (
    public requestId: string = getRandomRequestId(),
    public response: any,
    public statusCode: number,
    public errorCode: number,
    public message: string,
    public qs: any,
    public body: any,
  ) {
    super(`request_id: [${requestId}] status: [${statusCode}] message: [${message}]`)
  }
}
