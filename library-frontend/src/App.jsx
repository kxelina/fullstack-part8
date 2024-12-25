import { useState, useEffect } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
import Recommendation from "./components/Recommendations"
import './index.css'
import { useApolloClient } from "@apollo/client"


const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useEffect(() => {
    const token = localStorage.getItem("library-user-token")
    const tokenExpiration = localStorage.getItem("library-user-token-expiration")
    if (token && tokenExpiration > new Date().getTime()) {
      setToken(token)
    } else {
      setToken(null)
      localStorage.removeItem("library-user-token")
      localStorage.removeItem("library-user-token-expiration")
    }
  },[])
  console.log(token)

  const login = (token) => {
    setToken(token)
    localStorage.setItem("library-user-token", token)
    localStorage.setItem("library-user-token-expiration", new Date().getTime() + 60 * 60 * 1000)
  }

  const logout = () => { 
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <h2>Login</h2>
        <LoginForm setToken={login}/>
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={() => setPage("recommendations")}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommendation show={page === "recommendations"} />
    </div>
  )
}

export default App
