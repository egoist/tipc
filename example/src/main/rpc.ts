import fs from "fs"
import { initRPC } from "@egoist/typed-rpc/main"

const rpc = initRPC.create()

export const router = {
  logSomething: rpc.procedure
    .input<{ text: string }>()
    .action(async ({ input }) => {
      console.log(input.text)
    }),

  sum: rpc.procedure
    .input<{ a: number; b: number }>()
    .action(async ({ input }) => {
      return input.a + input.b
    }),

  readPkg: rpc.procedure.action(async () => {
    return fs.readFileSync("package.json", "utf-8")
  }),
}

export type Router = typeof router
