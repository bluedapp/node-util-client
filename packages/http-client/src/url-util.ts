/**
 * 添加协议头 并移除尾部的 `/` 符号
 * @param {string} url
 *
 * @example addFrontProtocol('some.domain.com')         -> http://some.domain.com
 * @example addFrontProtocol('http://some.domain.com/') -> http://some.domain.com/
 * @example addFrontProtocol('https://some.domain.com') -> https://some.domain.com
 * @example addFrontProtocol('https://some.domain.com') -> https://some.domain.com
 */
export function addFrontProtocol (url: string) {
  const expectType = 'string'
  const parmType = typeof url
  if (parmType !== expectType) throw new Error(`expect [url] ${expectType} but [${parmType}]`)

  return url.replace(/^(http(s)?:\/\/)?/, 'http$2://')
}

/**
 * 移除前后的 `/`
 * @param {string} path
 *
 * @example removeBorderSlash('/a/b')   -> 'a/b'
 * @example removeBorderSlash('/a/b/')  -> 'a/b'
 * @example removeBorderSlash('a/b')    -> 'a/b'
 */
export function removeBorderSlash (path: string) {
  const expectType = 'string'
  const parmType = typeof path
  if (parmType !== 'string') throw new Error(`expect [path] ${expectType} but [${parmType}]`)

  return path.replace(/^\/|\/$/g, '')
}

/**
 * 合并多段 URL
 * @param  {...any} path
 *
 * @example joinUrlPath('http://baidu.com/', '/a/b')  -> 'http://baidu.com/a/b'
 * @example joinUrlPath('http://baidu.com/', 'a/b/')  -> 'http://baidu.com/a/b'
 * @example joinUrlPath('http://baidu.com', 'a/b')    -> 'http://baidu.com/a/b'
 * @example joinUrlPath(['http://baidu.com', 'a/b'])  -> 'http://baidu.com/a/b'
 */
export function joinUrlPath (...path: string[]) {
  return [].concat(...path).map(removeBorderSlash).join('/')
}

/**
 * 生成URL
 * @param {*} domain
 * @param  {...string} path
 *
 * @example main('baidu.com', 'a', 'b')   -> 'http://baidu.com/a/b'
 * @example main(['baidu.com', 'a', 'b']) -> 'http://baidu.com/a/b'
 */
export default function main (...args: string[]) {
  const [domain, ...path] = [].concat(...args)
  return joinUrlPath(addFrontProtocol(domain), ...path)
}
