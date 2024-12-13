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
import { deriveNodePassword, doesNodeHaveDialInstalled, loginToNode, } from '../utilities/auth'
import 'react-toastify/dist/ReactToastify.css'
import { getFirstDialNode, UserNode } from '../types/UserNode'
dayjs.extend(relativeTime)

export const UserAuth = () => {
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
        addToast,
        getNodeDetails,
    } = useDialSiteStore()

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const [entryMode, setEntryMode] = useState<'login' | 'signup'>('login')
    const [userToken, setUserToken] = useState<string | null>(null)
    const [_ourDialNode, setOurDialNode] = useState<UserNode | null>(null)
    const [isInitialNodeCheck, setIsInitialNodeCheck] = useState(true)
    const [isLoggingIn, setIsLoggingIn] = useState(false)

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

    // [x] If the user has one dial plan node, sign them in to it.
    // [x] If the user has no nodes, redirect them to the signup page.
    // [ ] TODO: If the user has multiple dial plan nodes, open the node selection modal.
    // [x] If the user has one node with dial installed, but no dial plan nodes, sign them in to it.
    // [ ] TODO: If the user has multiple non-dial-plan nodes with dial installed, open the node selection modal.
    useEffect(() => {
        const handleNodeStatus = async () => {
            if (!userToken || isLoggingIn) {
                return
            }

            console.log('handle node status')

            const node = getFirstDialNode(userNodes)
            if (!node) { // no dial plan nodes
                if (Object.keys(userNodes).length > 0) {
                    // user has at least one node, but no dial plan nodes
                    console.log('user has at least one node, but no dial plan nodes')
                    // check for presence of installed dial
                    const installedIds: number[] = []
                    for (const node of Object.values(userNodes)) {
                        if (await doesNodeHaveDialInstalled(node)) {
                            installedIds.push(node.id)
                        }
                    }

                    if (installedIds.length > 0) {
                        // user has at least one node with dial installed, but no dial plan nodes
                        console.log('user has at least one node with dial installed, but no dial plan nodes')
                        // sign them in to it
                        // TODO: handle multiple non-plan nodes with dial installed
                        const thatNode = userNodes[installedIds[0] as any]
                        const deets = await getNodeDetails(thatNode.id)
                        thatNode.kinode_password ||= deets?.kinode_password
                        if (thatNode.kinode_password) {
                            setLoadingStage('kinode')
                            setIsInitialNodeCheck(true)
                            setIsLoggingIn(true)
                            await loginToNode(thatNode, thatNode.kinode_password, userToken).finally(() => {
                                setIsLoggingIn(false)
                            })
                        } else {
                            addToast('No password found for node. Please contact support.')
                        }
                        return
                    }
                }
                setIsInitialNodeCheck(false)
                setEntryMode('signup')
                return
            }

            // at this point we have confirmed the presence of a dial plan node
            console.log('user nodes', userNodes)

            if (node.ship_type !== 'kinode') {
                setLoadingStage(node.ship_type || '')
                return
            }

            console.log('user info', userInfo)
            try {
                let password: string | null = node.kinode_password || null

                if (loginMode === LoginMode.Email) {
                    password ||= node.kinode_password || null
                } else if (userInfo?.id) {
                    const serviceType = loginMode === LoginMode.X ? 'x' : 'siwe';
                    password ||= node.kinode_password || await deriveNodePassword(
                        userInfo.id.toString(),
                        serviceType
                    );
                } else {
                    addToast('No user ID found. Please contact support.')
                    setLoadingStage()
                    return
                }
                console.log('password', password)

                if (password) {
                    setIsLoggingIn(true)
                    await loginToNode(node, password, userToken).finally(() => {
                        setIsLoggingIn(false)
                    })
                } else {
                    addToast('Failed to derive node password', 'error')
                    setLoadingStage()
                }
            } catch (error) {
                addToast('Failed to login to node: ' + (error as Error).message)
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
    }, [userToken, userNodes, loginMode])

    useEffect(() => {
        const node = getFirstDialNode(userNodes)
        if (node) {
            setOurDialNode(node)

            if (node.link && node.ship_type === 'kinode') {
                setLoadingStage('kinode')
            }
        }
    }, [userNodes])

    const isMobile = useIsMobile()

    return (
        <>
            <NavBar />
            <div className="home-page flex grow self-stretch">
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
                            Curate the web's best content.
                        </div>
                    </div>
                    <div className="flex flex-col items-center self-stretch grow bg-white p-8 rounded-b-3xl gap-8 items-stretch">
                        {((!userToken && entryMode === 'signup') || (userToken)) && <>
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
                    // Clear all state immediately
                    onSignOut()

                    // Force a clean navigation to root
                    window.location.replace('/signout')

                    // if navigation doesn't occur, reload
                    setTimeout(() => {
                        if (window.location.pathname !== '/auth') {
                            window.location.reload()
                        }
                    }, 1000)
                }}
                className="fixed bottom-4 right-4 text-lg alt z-50"
            >
                Back
            </button>}
        </>
    )
}
