import fs from "fs"
import { tipc } from "@egoist/tipc/main"

const t = tipc.create()

const mathRouter = t.router({
  sum: t.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    }),
})

export const router = t.router({
  logSomething: t.procedure
    .input<{ text: string }>()
    .action(async ({ input }) => {
      console.log(input.text)
    }),

  readPkg: t.procedure.action(async () => {
    return fs.readFileSync("package.json", "utf-8")
  }),

  math: mathRouter,
})

export type Router = typeof router

export type RendererHandlers = {
  setTitle: (title: string) => void

  getUserAgent: () => string
}
