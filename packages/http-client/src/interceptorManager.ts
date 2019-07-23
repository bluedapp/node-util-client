export interface IThenParmas {
  fulfilled: any,
  rejected: any,
}

export default class InterceptorManager {
  protected handlers: IThenParmas[] = []

  public use = (fulfilled: any, rejected?: any): number => {
    const params: IThenParmas = {
      fulfilled,
      rejected
    }
    this.handlers.push(params)
    return this,this.handlers.length - 1
  }

  public eject = (index: number): void => {
    if (this.handlers[index]) this.handlers[index] = null
  }

  public forEach = (fn: any): void => {
    this.handlers.forEach(function forEachHandler (h) {
      if (h !== null) fn(h)
    })
  }
}