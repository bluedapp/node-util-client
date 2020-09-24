export interface IThenParams {
  fulfilled: any,
  rejected: any,
}

export default class InterceptorManager {
  protected handlers: IThenParams[] = []

  public use = (fulfilled: any, rejected?: any): number => {
    const params: IThenParams = {
      fulfilled,
      rejected,
    }
    this.handlers.push(params)
    return this.handlers.length - 1
  }

  public eject = (index: number): void => {
    if (this.handlers[index]) this.handlers[index] = null
  }

  public forEach = (fn: any): void => {
    this.handlers.forEach(h => {
      if (h !== null) fn(h)
    })
  }
}
