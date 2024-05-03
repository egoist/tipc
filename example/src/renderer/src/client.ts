import { createClient } from "@egoist/typed-rpc/react-query"
import { Router } from "../../main/rpc"

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke,
})
