import fs from "fs"
import { tipc } from "@egoist/tipc/main"

const t = tipc.create()

export const router = {
  logSomething: t.procedure
    .input<{ text: string }>()
    .action(async ({ input }) => {
      console.log(input.text)
    }),

  sum: t.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    }),

  readPkg: t.procedure.action(async () => {
    return fs.readFileSync("package.json", "utf-8")
  }),
}

export type Router = typeof router
