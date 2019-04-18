import crypto from 'crypto'

/**
 * 获取一个随机的请求ID
 * 用于日志定位
 * @return {string} 随机数
 * @example const requestId = getRandomRequestId()
 */
export function getRandomRequestId () {
  return crypto.randomBytes(16).toString('hex')
}
