import { createClient as createReactClient } from "@egoist/tipc/react-query"
import { createEventHandlers, createClient } from "@egoist/tipc/renderer"
import { Router, RendererHandlers } from "../../main/tipc"

export const reactClient = createReactClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke,
})

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke,
  ipcOn: window.electron.ipcRenderer.on,
})

export const handlers = createEventHandlers<RendererHandlers>({
  on: window.electron.ipcRenderer.on,
  send: window.electron.ipcRenderer.send,
})
