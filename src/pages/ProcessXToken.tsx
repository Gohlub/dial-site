import { useNavigate, useLocation } from 'react-router-dom'
import useDialSiteStore from '../store/dialSiteStore'
import { useEffect } from 'react'
import NavBar from '../components/NavBar'
import { Alerts } from '../components/Alerts'
import { SignupBox } from '../components/SignupBox'

export const ProcessXToken = () => {
    const location = useLocation()
    const nav = useNavigate()

    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')

    console.log({ token })

    useEffect(() => {
        if (token) {
            nav(`/?x=${token}`)
        } else {
            alert('Something went wrong. Please try again.')
        }
    }, [token])

    return (
        <>
            <NavBar />
            <Alerts />
        </>
    )
}
