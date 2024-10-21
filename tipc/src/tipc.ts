import {
  ActionGeneratorFunction,
  ActionPromiseFunction,
  ActionFunction,
} from "./types"

const createChainFns = <TInput extends object>() => {
  return {
    input<TInput extends object>() {
      return createChainFns<TInput>()
    },

    action: <TResult, T extends ActionFunction<TInput, TResult>>(action: T) => {
      return {
        action,
      }
    },
  }
}

const tipc = {
  create() {
    return {
      procedure: createChainFns(),
    }
  },
}

export { tipc }
