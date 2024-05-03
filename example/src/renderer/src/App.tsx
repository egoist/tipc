import Versions from "./components/Versions"
import electronLogo from "./assets/electron.svg"
import { client } from "./client"

function App() {
  const sumQuery = client.sum.useQuery({ a: 1, b: 2 })
  const pkgQuery = client.readPkg.useQuery()

  const utils = client.useUtils()

  return (
    <>
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
