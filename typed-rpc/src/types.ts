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
