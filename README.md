# @egoist/tipc

Typed IPC communication for Electron Apps.

## Install

```bash
npm i @egoist/tipc
```

## Calling main from renderer

Create a TIPC router:

```ts
// main/tipc.ts
import { tipc } from "@egoist/tipc/main"

const t = tipc.create()

export const router = {
  sum: t.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    }),
}

export type Router = typeof router
```

In Electron main process:

```ts
// main/index.ts
import { registerIpcMain } from "@egoist/tipc/main"
import { router } from "./tipc"

registerIpcMain(router)
```

This will register all the TIPC router methods as IPC handlers using Electron's `ipcMain.handle`.

In Electron renderer, create a TIPC client:

```ts
// renderer/client.ts
import { createClient } from "@egoist/tipc/renderer"
import { Router } from "../main/tipc"

export const client = createClient<Router>({
  // pass ipcRenderer.invoke function to the client
  // you can expose it from preload.js in BrowserWindow
  ipcInvoke: window.ipcRenderer.invoke,
})
```

Now you can call the TIPC methods in renderer process directly:

```ts
client.sum({ a: 1, b: 2 }).then(console.log)
// 3
```

### With React Query

Replace the `renderer/client.ts` with the following code:

```ts
//renderer/client.ts
import { createClient } from "@egoist/tipc/react-query"
import { Router } from "../main/tipc"

export const client = createClient<Router>({
  ipcInvoke: window.ipcRenderer.invoke,
})
```

Now you can use React Query methods:

```ts
const sumMutation = client.sum.useMutation()

sumMutation.mutate({ a: 1, b: 2 })
```

It's up to you to whether use the TIPC method as a query or mutation, you can use call `useQuery`:

```ts
const sumQuery = client.sum.useQuery({ a: 1, b: 2 })

sumQuery.data // 3 or undefined
sumQuery.isLoading // boolean
```

### Access `sender` in TIPC methods

```ts
export const router = {
  hello: t.procedure.action(async ({ context }) => {
    // sender is a WebContents instance that is calling this method
    context.sender.send("some-event")
    return `Hello, ${input.name}`
  }),
}
```

## Calling renderer from main

Define event handlers type for the renderer:

```ts
// main/renderer-handlers.ts
export type RendererHandlers = {
  helloFromMain: (message: string) => void
}
```

Send events from main to renderer:

```ts
// main/index.ts
import { getRendererHandlers } from "@egoist/tipc/main"
import { RendererHandlers } from "./renderer-handlers"

const window = new BrowserWindow({})

const handlers = getRendererHandlers<RendererHandlers>(window.webContents)

handlers.helloFromMain.send("Hello from main!")
```

But you also need to listen to events in renderer:

```ts
// renderer/tipc.ts
import { createEventHandlers } from "@egoist/tipc/renderer"
import { RendererHandlers } from "../main/renderer-handlers"

export const handlers = createHandlers<RendererHandlers>({
  // when using electron's ipcRenderer directly
  on: (channel, callback) => {
    window.ipcRenderer.on(channel, callback)
    return () => {
      window.ipcRenderer.off(channel, callback)
    }
  },

  // otherwise if using @electron-toolkit/preload or electron-vite
  // which expose a custom `on` method that does the above for you
  // on: window.electron.ipcRenderer.on,

  send: window.ipcRenderer.send,
})
```

Let's say you're using React, you can now listen to events in your component:

```tsx
//renderer/app.tsx
import { handlers } from "./tipc"

useEffect(() => {
  const unlisten = handlers.helloFromMain.on((message) => {
    console.log(message)
  })

  return unlisten
}, [])
```

### Get response from renderer

The `.send` method only send a message to renderer, if you want to get a response from renderer, you can use `.invoke` method:

```ts
// main/index.ts
const handlers = getRendererHandlers<RendererHandlers>(window.webContents)

handlers.calculateInRenderer.invoke(1, 2).then(console.log)
```

```tsx
// renderer/app.tsx
useEffect(() => {
  const unlisten = handlers.calculateInRenderer.handle((left, right) => {
    return left + right
  })

  return unlisten
}, [])
```

## License

MIT.
