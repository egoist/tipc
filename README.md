# @egoist/tipc

Typed IPC communication for Electron Apps.

## Install

```bash
npm i @egoist/tipc
```

## Usage

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
  ipcInvoke: window.electron.ipcRenderer.invoke,
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
  ipcInvoke: window.electron.ipcRenderer.invoke,
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

## License

MIT.
