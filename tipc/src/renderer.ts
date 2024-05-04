import { IpcRenderer, IpcRendererEvent } from "electron"
import type {
  ClientFromRouter,
  RouterType,
  RendererHandlers,
  RendererHandlersListener,
} from "./types"

export const createClient = <Router extends RouterType>({
  ipcInvoke,
}: {
  ipcInvoke: IpcRenderer["invoke"]
}) => {
  return new Proxy<ClientFromRouter<Router>>({} as any, {
    get: (_, prop) => {
      const invoke = (input: any) => {
        return ipcInvoke(prop.toString(), input)
      }

      return invoke
    },
  })
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
              console.log(event)
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
