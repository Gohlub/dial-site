import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import NavBar from '../components/NavBar'
import classNames from 'classnames'
import { useIsMobile } from '../utilities/dimensions'
import { LoginBox } from '../components/LoginBox'
import { SignupBox } from '../components/SignupBox'
import StagedLoadingOverlay from '../components/StagedLoadingOverlay'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useLocation } from 'react-router-dom'
import { NODE_LOADING_STAGES } from '../types/nodeLoadingStages'
import { deriveNodePassword, prepend0x, } from '../utilities/auth'
import 'react-toastify/dist/ReactToastify.css'
import { LandingPage } from '../components/LandingPage'
import { getFirstNode } from '../types/UserNode'
dayjs.extend(relativeTime)

export const Home = () => {

    const {
        getServerAlerts,
        onSignOut,
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
        userInfo,
        userNodes,
        serverIsUnderMaintenance,
        expectedAvailabilityDate,
        loadingStage,
        setLoadingStage,
        addClientAlert,
        userPasswordHash,
        hasSeenLanding,
        setHasSeenLanding,
    } = useDialSiteStore()

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const [entryMode, setEntryMode] = useState<'login' | 'signup'>('login')
    const [userToken, setUserToken] = useState<string | null>(null)
    const [_hasFetchedUserInfo, setHasFetchedUserInfo] = useState(false)
    const [isInitialNodeCheck, setIsInitialNodeCheck] = useState(true)

    useEffect(() => {
        const token = getTokenViaLoginMode()
        console.log('token', token)
        if (token && !userToken) {
            setUserToken(token)
        }
    }, [siweToken, xToken, emailToken])

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
        const handleNodeStatus = async () => {
            console.log('handle node status')
            if (Object.keys(userNodes).length > 0) {
                console.log('user nodes', userNodes)
                const node = getFirstNode(userNodes)
                if (node?.ship_type === 'kinode') {
                    console.log('user info', userInfo)
                    if (userInfo?.id) {
                        try {
                            let password: string | null = null

                            if (loginMode === LoginMode.Email) {
                                password = node.kinode_password || userPasswordHash
                            } else {
                                const serviceType = loginMode === LoginMode.X ? 'x' : 'siwe';
                                password = node.kinode_password || await deriveNodePassword(
                                    userInfo.id.toString(),
                                    serviceType
                                );
                            }
                            console.log('password', password)

                            if (password) {
                                password = prepend0x(password)

                                const nodeUrl = node.link.replace('http://', 'https://');

                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = `${nodeUrl}/login?redirect=${encodeURIComponent('/curator:dial:uncentered.os')}`;
                                form.enctype = 'text/plain';

                                const field = document.createElement('input');
                                field.type = 'hidden';
                                field.name = '{"password_hash":"' + password + '","subdomain":"", "';
                                field.value = '": "" }';
                                form.appendChild(field);

                                document.body.appendChild(form);
                                console.log('Form submission:', field.name + field.value);
                                form.submit();
                            } else {
                                addClientAlert('Failed to derive node password', 'error')
                                setLoadingStage()
                            }
                        } catch (error) {
                            addClientAlert('Failed to login to node: ' + (error as Error).message)
                        }
                    }
                } else {
                    setLoadingStage(node?.ship_type || '')
                }
            } else {
                setIsInitialNodeCheck(false)
                setEntryMode('signup')
            }
        }

        const fetchData = async () => {
            await getServerAlerts()
            if (userToken) {
                await getUserInfo()
                await getUserNodes()
                await handleNodeStatus()
            }
        }

        // Initial fetch on mount or when token changes
        fetchData()

        // Only set up interval if we have a token
        let intervalId: NodeJS.Timeout | undefined
        if (userToken) {
            intervalId = setInterval(fetchData, 10000)
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [userToken, userNodes, loginMode])

    useEffect(() => {
        const node = getFirstNode(userNodes)
        if (node) {
            setHasFetchedUserInfo(true)

            if (node.link && node.ship_type === 'kinode') {
                setLoadingStage('kinode')
            }
        }
    }, [userNodes])

    const handleGetStarted = () => {
        localStorage.setItem('hasSeenLanding', 'true')
        setHasSeenLanding(true)
    }

    if (!hasSeenLanding) {
        return <LandingPage onGetStarted={handleGetStarted} />
    }

    const isMobile = useIsMobile()

    return (
        <>
            <NavBar />
            <div className="flex grow self-stretch">
                <div className={classNames(
                    'flex flex-col place-items-center place-content-center self-stretch rounded-3xl bg-white/50 backdrop-blur-sm shadow-lg',
                    {
                        'grow w-screen max-w-screen': isMobile,
                        'max-w-lg m-auto': !isMobile,
                    },
                )}>
                    <div className="flex gap-8 items-center p-8">
                        <img
                            src="/icons/mic-mini.svg"
                            className={classNames('shadow-lg rounded-full p-4 bg-white flex justify-center items-center h-16 min-h-16 w-16 min-w-16')}
                        />
                        <div className="md:text-xl text-center">
                            Read and curate the best content from anywhere.
                        </div>
                    </div>
                    <div className="flex flex-col items-center self-stretch grow bg-white p-8 rounded-b-3xl gap-8 items-stretch">
                        {((!userToken && entryMode === 'signup') || (userToken && Object.keys(userNodes).length === 0)) && <>
                            {userToken && isInitialNodeCheck ? (
                                <StagedLoadingOverlay
                                    stages={{ checking: 'Checking your account...', kinode: 'Loading your kinode...' }}
                                    currentStage="checking"
                                    finalStage="kinode"
                                />
                            ) : (
                                <SignupBox />
                            )}
                            {!userToken && (
                                <>
                                    <div className="h-[1px] bg-black w-full" />
                                    <div className="flex flex-col gap-4 items-stretch self-stretch">
                                        <h4 className="self-center">Already have an account?</h4>
                                        <button
                                            className="text-lg alt"
                                            onClick={() => setEntryMode('login')}
                                        >
                                            Sign in
                                        </button>
                                    </div>
                                </>
                            )}
                        </>}
                        {(!userToken && entryMode === 'login') && <>
                            <LoginBox />
                            <div className="h-[1px] bg-black w-full" />
                            <div className="flex flex-col gap-4 items-stretch self-stretch">
                                <h4 className="self-center">Don't have an account?</h4>
                                <button
                                    className="text-lg alt min-w-[220px]"
                                    onClick={() => setEntryMode('signup')}
                                >
                                    Sign up
                                </button>
                                <button
                                    className="text-lg !bg-green border-green text-white flex items-center gap-2 min-w-[220px]"
                                    onClick={() => window.location.href = 'https://valet.uncentered.systems'}
                                >
                                    <img src="/valet-logo.svg" className="w-6 h-6" />
                                    <span>Manage Node</span>
                                </button>
                            </div>
                        </>}
                    </div>
                </div>
            </div>
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
            {userToken && <button
                onClick={() => {
                    onSignOut()
                    setUserToken(null)
                    window.location.reload()
                }}
                className="fixed bottom-4 right-4 text-lg alt z-50"
            >
                Sign out
            </button>}
        </>
    )
}
