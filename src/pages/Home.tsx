import useDialSiteStore from '../store/dialSiteStore'
import { useEffect, useState } from 'react'
import { UserNode } from '../types/UserNode'
import dayjs from 'dayjs'
import { Alerts } from '../components/Alerts'
import NavBar from '../components/NavBar'
import classNames from 'classnames'
import { useIsMobile } from '../utilities/dimensions'
import UserHome from '../components/UserHome'
import { LoginBox } from '../components/LoginBox'
import { SignupBox } from '../components/SignupBox'

export const Home = () => {
    const {
        getServerAlerts,
        get,
        token,
        getUserInfo,
        getUserNodes,
        serverIsUnderMaintenance,
        expectedAvailabilityDate,
        setActiveNode,
    } = useDialSiteStore()

    const [mode, setMode] = useState<'login' | 'signup'>('login')

    useEffect(() => {
        getServerAlerts()
        if (token) {
            getUserInfo()
            getUserNodes()
        }
        const intervalId = setInterval(async () => {
            await getServerAlerts()
            if (token) {
                await getUserInfo()
                await getUserNodes()
                const { userNodes, activeNode } = get()
                if (activeNode) {
                    const thatNode = userNodes.find(
                        (n: UserNode) => n.id === activeNode.id,
                    )
                    if (thatNode) setActiveNode(thatNode)
                }
            }
        }, 10000)

        return () => clearInterval(intervalId)
    }, [token])

    const isMobile = useIsMobile()

    return (
        <>
            <NavBar />
            <Alerts />
            {token && <UserHome />}
            {!token && (
                <div className="flex grow self-stretch">
                    <div
                        className={classNames(
                            'flex flex-col m-auto place-items-center px-8 py-4 place-content-center self-stretch rounded-2xl bg-white/50 backdrop-blur-sm gap-6 shadow-lg',
                            {},
                        )}
                    >
                        <img
                            src="/favicon.png"
                            className="h-24 min-h-24 w-24 min-w-24"
                        />

                        <div className="text-xl">
                            Read and curate the best content from anywhere.
                        </div>
                        {mode === 'login' && <LoginBox />}
                        {mode === 'signup' && <SignupBox />}
                        <div className="h-[1px] bg-black w-full" />
                        {mode === 'login' && (
                            <button
                                className="text-lg alt"
                                onClick={() => setMode('signup')}
                            >
                                Sign up
                            </button>
                        )}
                        {mode === 'signup' && (
                            <button
                                className="text-lg alt"
                                onClick={() => setMode('login')}
                            >
                                Sign in
                            </button>
                        )}
                    </div>
                </div>
            )}
            {serverIsUnderMaintenance && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col place-items-center place-content-center">
                    <div className="text-white text-4xl">
                        Server is under maintenance. Please try again later.
                    </div>
                    <div className="text-white text-2xl">
                        Service estimated back up{' '}
                        {expectedAvailabilityDate &&
                            dayjs(expectedAvailabilityDate * 1000).fromNow()}
                    </div>
                </div>
            )}
        </>
    )
}
