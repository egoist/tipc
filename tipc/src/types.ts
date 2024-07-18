export type ActionContext = {
  sender: Electron.WebContents
}

export type ActionPromiseFunction<TInput = any, TResult = any> = (args: {
  context: ActionContext
  input: TInput
}) => Promise<TResult>

export type ActionGeneratorFunction<TInput = any, TResult = any> = (args: {
  context: ActionContext
  input: TInput
}) => AsyncGenerator<TResult, any, unknown>

export type ActionFunction<TInput = any, TResult = any> =
  | ActionPromiseFunction<TInput, TResult>
  | ActionGeneratorFunction<TInput, TResult>

export type RouterType = Record<string, { action: ActionFunction }>

export type ClientFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K]["action"] extends ActionGeneratorFunction<
    infer P,
    infer R
  >
    ? (input: P extends unknown ? void : P) => Promise<ReadableStream<R>>
    : Router[K]["action"] extends ActionPromiseFunction<infer P, infer R>
    ? (input: P extends unknown ? void : P) => Promise<R>
    : never
}

export type RendererHandlers = Record<string, (...args: any[]) => any>

export type RendererHandlersListener<T extends RendererHandlers> = {
  [K in keyof T]: {
    listen: (handler: (...args: Parameters<T[K]>) => void) => () => void

    handle: (handler: T[K]) => () => void
  }
}

export type RendererHandlersCaller<T extends RendererHandlers> = {
  [K in keyof T]: {
    send: (...args: Parameters<T[K]>) => void

    invoke: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
  }
}
