import {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Procedure, RouterType } from "./types.js"
import { IpcRenderer } from "electron"

export const createClient = <Router extends RouterType>({
  ipcInvoke,
}: {
  ipcInvoke: IpcRenderer["invoke"]
}) => {
  const createUtilsProxy = (queryClient: QueryClient, path: string[]): any =>
    new Proxy(
      {},
      {
        get: (_, prop) => {
          if (typeof prop !== "string") return undefined

          if (prop === "setQueryData") {
            return (variables: unknown, updater: unknown) => {
              return queryClient.setQueryData([path.join("."), variables], updater)
            }
          }

          return createUtilsProxy(queryClient, [...path, prop])
        },
      }
    )

  const createProxy = (path: string[]): any =>
    new Proxy(
      {},
      {
        get: (_, prop) => {
          if (typeof prop !== "string") return undefined

          if (path.length === 0 && prop === "useUtils") {
            return () => {
              const queryClient = useQueryClient()

              return createUtilsProxy(queryClient, [])
            }
          }

          const channel = path.join(".")
          const invoke = (input: any) => {
            return ipcInvoke(channel, input)
          }

          if (prop === "useMutation") {
            return (mutationOptions?: any) => {
              return useMutation({
                ...mutationOptions,
                mutationFn: invoke,
              })
            }
          }

          if (prop === "useQuery") {
            return (variables: any, queryOptions?: any) => {
              return useQuery({
                ...queryOptions,
                queryKey: [channel, variables],
                queryFn: () => invoke(variables),
              })
            }
          }

          return createProxy([...path, prop])
        },
      }
    )

  return createProxy([]) as QueryClientFromRouter<Router>
}

export type QueryClientFromRouter<Router extends RouterType> = {
  useUtils: () => UtilsFromRouter<Router>
} & QueryHooksFromRouter<Router>

export type QueryHooksFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K] extends Procedure
    ? Router[K]["action"] extends (options: {
        context: any
        input: infer P
      }) => Promise<infer R>
      ? {
          useMutation: (
            mutationOptions?: UseMutationOptions<R, Error, P>
          ) => UseMutationResult<R, Error, P>

          useQuery: (
            variables: P,
            queryOptions?: Omit<UseQueryOptions<R, Error, P>, "queryKey">
          ) => UseQueryResult<R, Error>
        }
      : never
    : Router[K] extends RouterType
    ? QueryHooksFromRouter<Router[K]>
    : never
}

export type UtilsFromRouter<Router extends RouterType> = {
  [K in keyof Router]: Router[K] extends Procedure
    ? Router[K]["action"] extends (options: {
        context: any
        input: infer P
      }) => Promise<infer R>
      ? {
          setQueryData: (
            variables: P,
            updater: R | ((prev: R | undefined) => R | undefined)
          ) => void

          removeQueryCache: (variables: P) => void
        }
      : never
    : Router[K] extends RouterType
    ? UtilsFromRouter<Router[K]>
    : never
}
