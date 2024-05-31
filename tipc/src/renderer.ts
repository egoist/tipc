import { IpcRenderer, IpcRendererEvent } from "electron"
import type {
  ClientFromRouter,
  RouterType,
  RendererHandlers,
  RendererHandlersListener,
} from "./types"

type IpcOn = (
  channel: string,
  handler: (event: IpcRendererEvent, ...args: any[]) => void
) => () => void

export const createClient = <Router extends RouterType>({
  ipcInvoke,
  ipcOn,
}: {
  ipcInvoke: IpcRenderer["invoke"]
  ipcOn: IpcOn
}) => {
  return new Proxy<ClientFromRouter<Router>>({} as any, {
    get: (_, prop) => {
      const invoke = async (input: any) => {
        const result = await ipcInvoke(prop.toString(), input)
        if (typeof result === "string" && result.startsWith("|tipc-stream|")) {
          const channel = result

          return new ReadableStream({
            start(controller) {
              const handler = (
                _: any,
                type: "start" | "end" | "data",
                data: any
              ) => {
                if (type === "end") {
                  off()
                  controller.close()
                }
                if (type === "data") {
                  controller.enqueue(data)
                }
              }
              const off = ipcOn(channel, handler)
            },
          })
        }

        return result
      }

      return invoke
    },
  })
}

export const createEventHandlers = <T extends RendererHandlers>({
  on,

  send,
}: {
  on: IpcOn

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
