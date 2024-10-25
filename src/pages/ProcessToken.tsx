import { useNavigate, useLocation } from "react-router-dom"
import useValetStore from "../store/valetStore"
import { useEffect } from "react"
import NavBar from "../components/NavBar"

export const ProcessToken = () => {
  const location = useLocation()
  const nav = useNavigate()
  const { setToken } = useValetStore()

  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get('token')

  console.log({ token })

  useEffect(() => {
    if (token) {
      setToken(token)
    } else {
      alert('Something went wrong. Please try again.')
    }
    nav('/')
  }, [token])

  return (<>
    <NavBar />
    <h1>Processing...</h1>
  </>)
}