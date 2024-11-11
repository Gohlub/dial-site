import { useNavigate, useLocation } from 'react-router-dom'
import useDialSiteStore from '../store/dialSiteStore'
import { useEffect } from 'react'
import NavBar from '../components/NavBar'
import { Alerts } from '../components/Alerts'

export const ProcessXToken = () => {
    const location = useLocation()
    const nav = useNavigate()
    const { addClientAlert } = useDialSiteStore()
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')

    console.log({ token })

    useEffect(() => {
        if (token) {
            nav(`/?x=${token}`)
        } else {
            addClientAlert('Something went wrong. Please try again.', 'error')
        }
    }, [token])

    return (
        <>
            <NavBar />
            <Alerts />
        </>
    )
}
