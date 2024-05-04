import { ipcMain } from "electron"
import { ActionFunction, RouterType } from "./types"

const createChainFns = <TInput>() => {
  return {
    input<TInput>() {
      return createChainFns<TInput>()
    },

    action: <TResult>(action: ActionFunction<TInput, TResult>) => {
      return {
        action,
      }
    },
  }
}

const tipc = {
  create() {
    return {
      procedure: createChainFns<void>(),
    }
  },
}

export { tipc }

export const registerIpcMain = (router: RouterType) => {
  for (const [name, route] of Object.entries(router)) {
    ipcMain.handle(name, (e, payload) => {
      return route.action({ context: { sender: e.sender }, input: payload })
    })
  }
}

export * from "./types"
