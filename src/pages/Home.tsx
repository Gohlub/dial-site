import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
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
import { useLocation } from 'react-router-dom'
import { NODE_LOADING_STAGES } from '../types/nodeLoadingStages'
dayjs.extend(relativeTime)

export const Home = () => {
    const {
        getServerAlerts,
        get,
        xToken,
        siweToken,
        emailToken,
        setXToken,
        setSiweToken,
        setEmailToken,
        loginMode,
        setLoginMode,
        getTokenViaLoginMode,
        getUserInfo,
        getUserNodes,
        userNodes,
        serverIsUnderMaintenance,
        expectedAvailabilityDate,
        loadingStage,
        setLoadingStage,
    } = useDialSiteStore()

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const [entryMode, setEntryMode] = useState<'login' | 'signup'>('login')
    const [userToken, setUserToken] = useState<string | null>(null)

    useEffect(() => {
        const xTokenQueryParam = searchParams.get('x')
        if (xTokenQueryParam && xTokenQueryParam !== xToken) {
            setLoginMode(LoginMode.X)
            setXToken(xTokenQueryParam)
            setEmailToken('')
            setSiweToken('')
        }
    }, [searchParams])

    useEffect(() => {
        setUserToken(getTokenViaLoginMode())
    }, [xToken, siweToken, emailToken])

    useEffect(() => {
        getServerAlerts()
        if (userToken) {
            getUserInfo()
            getUserNodes()
        }
        const intervalId = setInterval(async () => {
            await getServerAlerts()
            if (userToken) {
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
    }, [userToken])

    useEffect(() => {
        if (userNodes?.length > 0) {
            const firstNode = userNodes[0]
            if (firstNode?.link && firstNode.ship_type === 'kinode') {
                setLoadingStage('kinode')
                // window.location.href = `${firstNode.link}/login`
            }
        }
    }, [userNodes])

    const isMobile = useIsMobile()

    // const showSignIn = !userToken || userNodes?.length === 0
    // console.log({ userNodes, userToken })

    return (
        <>
            <NavBar />
            <Alerts />
            {!userToken && (
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
                            className={classNames('shadow-lg rounded-xl', {
                                'h-24 min-h-24 w-24 min-w-24': !isMobile,
                                'h-16 min-h-16 w-16 min-w-16': isMobile,
                            })}
                        />

                        <div className="md:text-xl text-center">
                            Read and curate the best content from anywhere.
                        </div>
                        {entryMode === 'login' && <LoginBox />}
                        {entryMode === 'signup' && <SignupBox />}
                        <div className="h-[1px] bg-black w-full" />
                        {entryMode === 'login' && (
                            <>
                                <h4>Don't have an account?</h4>
                                <button
                                    className="text-lg alt"
                                    onClick={() => setEntryMode('signup')}
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                        {entryMode === 'signup' && (
                            <>
                                <h4>Already have an account?</h4>
                                <button
                                    className="text-lg alt"
                                    onClick={() => setEntryMode('login')}
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            {userToken && userNodes?.length === 0 && <SignupBox />}
            {loadingStage && <StagedLoadingOverlay
                stages={NODE_LOADING_STAGES}
                currentStage={loadingStage}
                finalStage="kinode"
            />}
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
