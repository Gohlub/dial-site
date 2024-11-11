import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
import { useEffect, useState, useRef } from 'react'
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
import { deriveNodePassword, loginToNode } from '../utilities/auth'
import 'react-toastify/dist/ReactToastify.css'
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
        userInfo,
        userNodes,
        serverIsUnderMaintenance,
        expectedAvailabilityDate,
        loadingStage,
        setLoadingStage,
        addClientAlert,
        userPasswordHash,
        setUserPasswordHash,
    } = useDialSiteStore()

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const [entryMode, setEntryMode] = useState<'login' | 'signup'>('login')
    const [userToken, setUserToken] = useState<string | null>(null)

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
            if (userNodes?.[0]) {
                console.log('user nodes', userNodes)
                if (userNodes[0].ship_type === 'kinode') {
                    console.log('user info', userInfo)
                    if (userInfo?.id) {
                        try {
                            let password: string | null = null

                            if (loginMode === LoginMode.Email) {
                                password = userPasswordHash
                            } else {
                                const serviceType = loginMode === LoginMode.X ? 'x' : 'siwe';
                                password = await deriveNodePassword(
                                    userInfo.id.toString(),
                                    serviceType
                                );
                            }
                            console.log('password', password)

                            if (password) {
                                if (!password.startsWith('0x')) {
                                    password = '0x' + password
                                }

                                const nodeUrl = userNodes[0].link.replace('http://', 'https://');

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
                            }
                        } catch (error) {
                            addClientAlert('Failed to login to node: ' + (error as Error).message)
                        }
                    }
                } else {
                    setLoadingStage(userNodes[0].ship_type)
                }
            } else {
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
        if (userNodes?.length > 0) {
            const firstNode = userNodes[0]
            if (firstNode?.link && firstNode.ship_type === 'kinode') {
                setLoadingStage('kinode')

            }
        }
    }, [userNodes])

    const isMobile = useIsMobile()

    return (
        <>
            <NavBar />
            {((!userToken && entryMode === 'signup') || (userToken && userNodes?.length === 0)) && (
                <div className="flex grow self-stretch">
                    <div className={classNames(
                        'flex flex-col place-items-center px-8 py-4 place-content-center self-stretch rounded-2xl bg-white/50 backdrop-blur-sm md:gap-6 gap-4 shadow-lg',
                        {
                            'grow': isMobile,
                            'm-auto': !isMobile,
                        },
                    )}>
                        <img
                            src="/favicon.png"
                            className={classNames('shadow-lg rounded-xl', {
                                'h-24 min-h-24 w-24 min-w-24': !isMobile,
                                'h-16 min-h-16 w-16 min-w-16': isMobile,
                            })}
                        />
                        {!userToken && (
                            <>
                                <div className="md:text-xl text-center">
                                    Read and curate the best content from anywhere.
                                </div>
                            </>
                        )}
                        <SignupBox />
                        {!userToken && (
                            <>
                                <div className="h-[1px] bg-black w-full" />
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
            {(!userToken && entryMode === 'login') && (
                <div className="flex grow self-stretch">
                    <div className={classNames(
                        'flex flex-col place-items-center px-8 py-4 place-content-center self-stretch rounded-2xl bg-white/50 backdrop-blur-sm md:gap-6 gap-4 shadow-lg',
                        {
                            'grow': isMobile,
                            'm-auto': !isMobile,
                        },
                    )}>
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
                        <LoginBox />
                        <div className="h-[1px] bg-black w-full" />
                        <h4>Don't have an account?</h4>
                        <button
                            className="text-lg alt"
                            onClick={() => setEntryMode('signup')}
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            )}
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
