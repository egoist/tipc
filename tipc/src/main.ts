import stream from "node:stream"
import crypto from "node:crypto"
import { WebContents, ipcMain } from "electron"
import { RendererHandlers, RendererHandlersCaller, RouterType } from "./types"
import { tipc } from "./tipc"

export { tipc }

const noopAsyncGenerator = async function* () {}
  .constructor as AsyncGeneratorFunction

const sendGeneratorResult = async (
  sender: WebContents,
  channel: string,
  result: AsyncGenerator
) => {
  sender.send(channel, "start")
  for await (const chunk of result) {
    sender.send(channel, "data", chunk)
  }
  sender.send(channel, "end")
}

export const registerIpcMain = (router: RouterType) => {
  for (const [name, route] of Object.entries(router)) {
    ipcMain.handle(name, async (e, payload) => {
      const action = route.action
      const result = action({
        context: { sender: e.sender },
        input: payload,
      })

      if (action instanceof noopAsyncGenerator) {
        const id = crypto.randomUUID()
        const channel = `|tipc-stream|${id}`
        sendGeneratorResult(e.sender, channel, result as AsyncGenerator)
        return channel
      }

      return result
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

export * from "./types"
