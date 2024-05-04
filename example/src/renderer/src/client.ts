import { createClient } from "@egoist/tipc/react-query"
import { Router } from "../../main/tipc"

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke,
})
