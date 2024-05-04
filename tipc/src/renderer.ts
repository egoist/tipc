import { IpcRenderer } from "electron"
import type { ClientFromRouter, RouterType } from "./types"

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
