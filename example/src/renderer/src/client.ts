import { createClient } from "@egoist/tipc/react-query"
import { createEventHandlers } from "@egoist/tipc/renderer"
import { Router, RendererHandlers } from "../../main/tipc"

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke,
})

export const handlers = createEventHandlers<RendererHandlers>({
  on: window.electron.ipcRenderer.on,
  send: window.electron.ipcRenderer.send,
})
