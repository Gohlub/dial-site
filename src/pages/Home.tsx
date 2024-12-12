import { Holoscope } from "../components/Holoscope"
import { LandingPage } from "../components/LandingPage"
import NavBar from "../components/NavBar"
import useDialSiteStore from "../store/dialSiteStore"

export const Home = () => {
    const { hasSeenLanding, setHasSeenLanding } = useDialSiteStore()

    const handleGetStarted = () => {
        localStorage.setItem('hasSeenLanding', 'true')
        setHasSeenLanding(true)
    }

    if (!hasSeenLanding) {
        return <LandingPage onGetStarted={handleGetStarted} />
    }

    return (
        <>
            <NavBar />
            <Holoscope />
        </>
    )
}
