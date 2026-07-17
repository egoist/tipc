import crypto from "node:crypto"
import { WebContents, ipcMain } from "electron"
import {
  Procedure,
  RendererHandlers,
  RendererHandlersCaller,
  RouterType,
} from "./types.js"
import { tipc } from "./tipc.js"

export { tipc }

const flattenRouter = (
  router: RouterType,
  prefix = "",
  routes: Record<string, Procedure> = {}
) => {
  for (const [name, route] of Object.entries(router)) {
    const channel = prefix ? `${prefix}.${name}` : name

    if (typeof (route as Procedure).action === "function") {
      routes[channel] = route as Procedure
    } else {
      flattenRouter(route as RouterType, channel, routes)
    }
  }
  return routes
}

export const registerIpcMain = (router: RouterType) => {
  for (const [channel, route] of Object.entries(flattenRouter(router))) {
    ipcMain.handle(channel, (e, payload) => {
      return route.action({ context: { sender: e.sender }, input: payload })
    })
  }
}

export const getRendererHandlers = <T extends RendererHandlers>(
  contents: WebContents
) => {
  return new Proxy<RendererHandlersCaller<T>>({} as any, {
    get: (_, prop) => {
      return {
        send: (...args: any[]) => contents.send(prop.toString(), ...args),

        invoke: async (...args: any[]) => {
          const id = crypto.randomUUID()

          return new Promise((resolve, reject) => {
            ipcMain.once(id, (_, { error, result }) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            })
            contents.send(prop.toString(), id, ...args)
          })
        },
      }
    },
  })
}

export * from "./types.js"
