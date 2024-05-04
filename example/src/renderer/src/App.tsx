import Versions from "./components/Versions"
import electronLogo from "./assets/electron.svg"
import { client, handlers } from "./client"
import { useEffect, useState } from "react"

function App() {
  const sumQuery = client.sum.useQuery({ a: 1, b: 2 })
  const pkgQuery = client.readPkg.useQuery()
  const [title, setTitle] = useState("")

  const utils = client.useUtils()

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
