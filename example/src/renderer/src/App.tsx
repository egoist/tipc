import Versions from "./components/Versions"
import electronLogo from "./assets/electron.svg"
import { reactClient, handlers, client } from "./client"
import { useEffect, useState } from "react"

const run = async () => {
  const stream = await client.readPkgStream()

  const reader = stream.getReader()

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }
    console.log(value)
  }
}

function App() {
  const sumQuery = reactClient.sum.useQuery({ a: 1, b: 2 })
  const pkgQuery = reactClient.readPkg.useQuery()
  const [title, setTitle] = useState("")

  const utils = reactClient.useUtils()

  useEffect(() => {
    const unsubscribe = handlers.setTitle.listen((title) => {
      setTitle(title)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    return handlers.getUserAgent.handle(() => {
      // error works too
      // throw new Error("not implemented")
      return window.navigator.userAgent
    })
  }, [])

  useEffect(() => {
    run()
  }, [])

  return (
    <>
      <h1>{title}</h1>
      <img alt="logo" className="logo" src={electronLogo} />

      <div className="actions">
        <div className="action">
          <button>{sumQuery.data}</button>

          <button
            onClick={() => {
              utils.sum.setQueryData({ a: 1, b: 2 }, 666)
            }}
          >
            set sum data
          </button>
        </div>

        <div>
          <pre>
            <code>{pkgQuery.data}</code>
          </pre>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
