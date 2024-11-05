import useDialSiteStore from '../store/dialSiteStore'
import { useEffect, useState } from 'react'
import { UserNode } from '../types/UserNode'
import dayjs from 'dayjs'
import { Alerts } from '../components/Alerts'
import NavBar from '../components/NavBar'
import classNames from 'classnames'
import { useIsMobile } from '../utilities/dimensions'
import { LoginBox } from '../components/LoginBox'
import { SignupBox } from '../components/SignupBox'
import StagedLoadingOverlay from '../components/StagedLoadingOverlay'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export const Home = () => {
    const {
        getServerAlerts,
        get,
        emailToken: token,
        getUserInfo,
        getUserNodes,
        userNodes,
        serverIsUnderMaintenance,
        expectedAvailabilityDate,
        loadingStage,
        setLoadingStage,
    } = useDialSiteStore()

    const [mode, setMode] = useState<'login' | 'signup'>('login')
    console.log({ loadingStage })

    useEffect(() => {
        if (!token) {
            setLoadingStage()
        }
    }, [loadingStage])

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
                const { userNodes } = get()
                const loadingNode = userNodes.find(
                    (n: UserNode) => n.ship_type !== 'kinode',
                )
                if (loadingNode) {
                    setLoadingStage(loadingNode.ship_type)
                }
            }
        }, 10000)

        return () => clearInterval(intervalId)
    }, [token])

    const isMobile = useIsMobile()

    const showSignIn = !token || userNodes?.length === 0

    return (
        <>
            <NavBar />
            <Alerts />
            {showSignIn && (
                <div className="flex grow self-stretch">
                    <div
                        className={classNames(
                            'flex flex-col place-items-center px-8 py-4 place-content-center self-stretch rounded-2xl bg-white/50 backdrop-blur-sm md:gap-6 gap-4 shadow-lg',
                            {
                                'grow': isMobile,
                                'm-auto': !isMobile,
                            },
                        )}
                    >
                        <img
                            src="/favicon.png"
                            className={classNames('shadow-lg', {
                                'h-24 min-h-24 w-24 min-w-24': !isMobile,
                                'h-16 min-h-16 w-16 min-w-16': isMobile,
                            })}
                        />

                        <div className="md:text-xl text-center">
                            Read and curate the best content from anywhere.
                        </div>
                        {mode === 'login' && <LoginBox />}
                        {mode === 'signup' && <SignupBox />}
                        <div className="h-[1px] bg-black w-full" />
                        {mode === 'login' && (
                            <>
                                <h4>Don't have an account?</h4>
                                <button
                                    className="text-lg alt"
                                    onClick={() => setMode('signup')}
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                        {mode === 'signup' && (
                            <>
                                <h4>Already have an account?</h4>
                                <button
                                    className="text-lg alt"
                                    onClick={() => setMode('login')}
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            {loadingStage && <StagedLoadingOverlay />}
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
