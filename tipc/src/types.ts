export type ActionContext = {
  sender: Electron.WebContents
}

export type ActionFunction<TInput = any, TResult = any> = (args: {
  context: ActionContext
  input: TInput
}) => Promise<TResult>

export type RouterType = Record<string, { action: ActionFunction }>

export type ClientFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K]["action"] extends (options: {
    context: any
    input: infer P
  }) => Promise<infer R>
    ? (input: P) => Promise<R>
    : never
}

export type RendererHandlers = Record<string, (...args: any[]) => any>

export type RendererHandlersListener<T extends RendererHandlers> = {
  [K in keyof T]: {
    listen: (handler: T[K]) => () => void

    handle: (handler: T[K]) => () => void
  }
}

export type RendererHandlersCaller<T extends RendererHandlers> = {
  [K in keyof T]: {
    send: (...args: Parameters<T[K]>) => void

    invoke: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
  }
}
