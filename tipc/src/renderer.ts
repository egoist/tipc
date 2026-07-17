import { IpcRenderer, IpcRendererEvent } from "electron"
import type {
  ClientFromRouter,
  RouterType,
  RendererHandlers,
  RendererHandlersListener,
} from "./types.js"

export const createClient = <Router extends RouterType>({
  ipcInvoke,
}: {
  ipcInvoke: IpcRenderer["invoke"]
}) => {
  const createProxy = (path: string[]): any =>
    new Proxy(() => {}, {
      get: (_, prop) =>
        typeof prop === "string"
          ? createProxy([...path, prop])
          : undefined,

      apply: (_, __, [input]) => ipcInvoke(path.join("."), input),
    })

  return createProxy([]) as ClientFromRouter<Router>
}

export const createEventHandlers = <T extends RendererHandlers>({
  on,

  send,
}: {
  on: (
    channel: string,
    handler: (event: IpcRendererEvent, ...args: any[]) => void
  ) => () => void

  send: IpcRenderer["send"]
}) =>
  new Proxy<RendererHandlersListener<T>>({} as any, {
    get: (_, prop) => {
      return {
        listen: (handler: any) =>
          on(prop.toString(), (event, ...args) => handler(...args)),

        handle: (handler: any) => {
          return on(prop.toString(), async (event, id: string, ...args) => {
            try {
              const result = await handler(...args)
              send(id, { result })
            } catch (error) {
              send(id, { error })
            }
          })
        },
      }
    },
  })
