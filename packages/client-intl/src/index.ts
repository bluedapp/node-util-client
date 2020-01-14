import ConfIntl from '@blued-core/conf-intl'
import CacheIntl from '@blued-core/cache-intl'

export interface ClientResourceIntl<T = any> {
  client: T,
  clean (): void
}

export interface ClientIntl<T extends any = any> {
  conf: ConfIntl
  cache: CacheIntl
  interval?: number
  keepInstanceCount?: number
  isLocal?: boolean
  option?: Record<string, any>

  getClient (key: string, force?: boolean): T
  buildClient (key: string): ClientResourceIntl<T>
}

export interface PerformanceClientInstance {
  timer (path: string, val: number): void
  counter (path: string, val: number): void
}

export type PerformanceClientIntl = ClientIntl<PerformanceClientInstance>

export interface ExceptionReportClientInstance {
  captureException (e: Error, callback?: Function): void
  captureMessage (message: string): void
}

export type ExceptionReportClientIntl = ClientIntl<ExceptionReportClientInstance>
