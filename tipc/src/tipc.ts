import { ActionFunction } from "./types"

const createChainFns = <TInput>() => {
  return {
    input<TInput>() {
      return createChainFns<TInput>()
    },

    action: <TResult>(action: ActionFunction<TInput, TResult>) => {
      return {
        action,
      }
    },
  }
}

const tipc = {
  create() {
    return {
      procedure: createChainFns<void>(),
    }
  },
}

export { tipc }
