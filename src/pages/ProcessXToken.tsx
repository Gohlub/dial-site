import { useNavigate, useLocation } from 'react-router-dom'
import useDialSiteStore from '../store/dialSiteStore'
import { useEffect } from 'react'
import NavBar from '../components/NavBar'

export const ProcessXToken = () => {
    const location = useLocation()
    const nav = useNavigate()
    const { addToast } = useDialSiteStore()
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')

    console.log({ token })

    useEffect(() => {
        if (token) {
            nav(`/?x=${token}`)
        } else {
            addToast('Something went wrong. Please try again.', 'error')
        }
    }, [token])

    return (
        <>
            <NavBar />
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Processing X Token...</h1>
            </div>
        </>
    )
}
