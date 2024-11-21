import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
import { useCallback, useEffect, useState } from 'react'
import { useIsMobile } from '../utilities/dimensions'
import { sha256 } from '../utilities/hash'
import { FaCircleNotch } from 'react-icons/fa'
import { FaEnvelope, FaEthereum, FaXTwitter } from 'react-icons/fa6'
import classNames from 'classnames'
import { debounce } from '../utilities/debounce'
import StagedLoadingOverlay from './StagedLoadingOverlay'
import { SiweMessage } from 'siwe'
import { ethers } from 'ethers'
import { OPTIMISM_CHAIN_ID, switchToOptimism } from '../utilities/eth'
import { getFirstDialNode } from '../types/UserNode'

export const SignupBox = () => {
    const {
        registerEmail,
        verifyEmail,
        setLoadingStage,
        pendingSubscription,
        setPendingSubscription,
        redirectToX,
        checkIsNodeAvailable,
        checkProducts,
        purchaseProduct,
        addContactEmail,
        assignSubscription,
        userNodes,
        userInfo,
        addClientAlert,
        getSiweNonce,
        siweNonce,
        loginMode,
        setLoginMode,
        getTokenViaLoginMode,
        registerSiwe,
        siweToken,
        xToken,
        emailToken,
        setUserPasswordHash,
        userPasswordHash,
    } = useDialSiteStore()
    const [loading, setLoading] = useState(false)
    const [signupStage, setSignupStage] = useState<
        'credentials' | 'code' | 'node-name' | 'await-boot' | 'complete'
    >('credentials')
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [signupPasswordHash, setSignupPasswordHash] = useState('')
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
    const [signupConfirmPasswordHash, setSignupConfirmPasswordHash] =
        useState('')
    const [signupCode, setSignupCode] = useState('')
    const [alertText, setAlertText] = useState('')
    const [signupNodeName, setSignupNodeName] = useState('')
    const [nodeNameAvailable, setNodeNameAvailable] = useState(false)
    const [initializationStage, setInitializationStage] = useState<keyof typeof INITIALIZATION_STAGES>('none')
    const [hasPurchasedFreeTrial, setHasPurchasedFreeTrial] = useState(false)

    console.log({
        loading,
        signupStage,
        signupEmail,
        signupPassword,
        signupConfirmPassword,
        signupCode,
        signupNodeName,
        nodeNameAvailable,
        alertText,
        userNodes,
        userInfo,
        loginMode,
        siweNonce,
        initializationStage,
        token: getTokenViaLoginMode(),
        signupPasswordHash,
        signupConfirmPasswordHash,
    })

    const INITIALIZATION_STAGES = {
        'none': '',
        'check-products': 'Checking products...',
        'purchase-free-trial': 'Purchasing free trial...',
        'assign-subscription': 'Assigning subscription...',
        'add-contact-email': 'Adding contact email...',
        'complete': 'Account created!',
    }

    const onSignupPasswordChanged = async (password: string) => {
        setSignupPassword(password)
        const hashHex = await sha256(password)
        setSignupPasswordHash(hashHex)
    }

    const onSignupConfirmPasswordChanged = async (password: string) => {
        setSignupConfirmPassword(password)
        const hashHex = await sha256(password)
        setSignupConfirmPasswordHash(hashHex)
    }

    const onSignupWithEmail = async () => {
        setLoading(true)
        if (signupPassword !== signupConfirmPassword) {
            setAlertText('Passwords do not match')
            return
        }
        if (signupPassword.length < 8 || signupConfirmPassword.length < 8) {
            setAlertText('Password must be at least 8 characters long.')
            return
        }
        setAlertText('')
        const result = await registerEmail(
            signupEmail,
            signupConfirmPasswordHash,
        )
        setLoading(false)
        if (result) {
            setLoginMode(LoginMode.Email)
            setSignupStage('code')
            return
        }
        setAlertText(
            'Failed to register email. Please try again or contact admin@uncentered.systems if issues persist.',
        )
    }

    const onVerify = async () => {
        setLoading(true)
        setLoginMode(LoginMode.Email)
        const result = await verifyEmail(
            signupEmail,
            signupPasswordHash,
            signupCode,
        )
        setLoading(false)
        if (result) {
            setSignupStage('node-name')
        }
    }

    const onSiweSignupClick = async () => {
        setAlertText('')
        setLoading(true)
        setLoginMode(LoginMode.SIWE)
        try {
            console.log('checking ethereum')
            if (!(window as any).ethereum) {
                setAlertText('Please install MetaMask or another Ethereum wallet')
                return
            }

            // Ensure we're on Optimism
            await switchToOptimism()

            console.log('getting signer')
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const signer = await provider.getSigner()
            const address = await signer.getAddress()

            console.log('getting nonce')
            const nonce = await getSiweNonce()
            console.log({ nonce })
            console.log('creating message')
            // Create SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in with Ethereum to Dial.',
                uri: window.location.origin,
                version: '1',
                chainId: Number(OPTIMISM_CHAIN_ID),
                nonce
            })

            console.log({ message })

            // Convert to text
            const messageToSign = message.prepareMessage()

            // Request signature from wallet
            const signature = await signer.signMessage(messageToSign)

            await registerSiwe(messageToSign, signature)
            setSignupStage('node-name')
        } catch (error) {
            console.error(error)
            setAlertText('Failed to sign in with Ethereum: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (signupStage === 'credentials') {
            if (loginMode === LoginMode.X && xToken && !getFirstDialNode(userNodes)) {
                setSignupStage('node-name')
                if (!signupPasswordHash) {
                    sha256(xToken).then(hashHex => {
                        setSignupPasswordHash(hashHex)
                    })
                }
            } else if (loginMode === LoginMode.SIWE && siweToken && !getFirstDialNode(userNodes)) {
                setSignupStage('node-name')
                if (!signupPasswordHash) {
                    sha256(siweToken).then(hashHex => {
                        setSignupPasswordHash(hashHex)
                    })
                }
            } else if (loginMode === LoginMode.Email && emailToken && !getFirstDialNode(userNodes)) {
                setSignupStage('node-name')
                setLoadingStage()
                sha256(emailToken).then(hashHex => {
                    setSignupPasswordHash(userPasswordHash || hashHex)
                })
            }
        } else if (Object.keys(userNodes).length > 0) {
            const node = getFirstDialNode(userNodes)
            if (node?.kinode_password) {
                setSignupPasswordHash(node.kinode_password)
            }
        }
    }, [loginMode, signupStage, siweToken, emailToken, xToken, userNodes])

    useEffect(() => {
        if (loginMode === LoginMode.Email) {
            if (signupPassword !== signupConfirmPassword) {
                setAlertText('Passwords do not match')
            } else {
                setAlertText('')
            }
        }
    }, [signupPassword, signupConfirmPassword])

    const debouncedNodeNameCheck = useCallback(
        debounce(async (nodeName: string) => {
            const result = await checkIsNodeAvailable(nodeName)
            setNodeNameAvailable(result)
            setAlertText(result ? '' : 'Node name is not available.')
        }, 500),
        []
    )

    useEffect(() => {
        if (signupStage !== 'node-name') return
        if (signupNodeName === '') {
            setAlertText('Please enter a node name.')
            return
        }
        if (!signupNodeName.match(/^[a-z0-9-]+$/)) {
            setAlertText('Node name must be alphanumeric, with dashes allowed.')
            return
        }
        if (signupNodeName.length < 9) {
            setAlertText('Node name must be at least 9 characters long.')
            return
        }
        debouncedNodeNameCheck(signupNodeName)
    }, [signupNodeName])

    const onPurchaseFreeTrial = async () => {
        setInitializationStage('check-products')
        let subscription: { subscriptionId: number, message: string } | null = pendingSubscription
        if (!hasPurchasedFreeTrial && !subscription) {
            const products = await checkProducts('en')
            // console.log({ products })
            const freeTrialProduct = products.find(p => p.title === 'Dial Subscription')
            if (!freeTrialProduct) {
                addClientAlert('No free trial product found (E#1).')
                return
            }
            const freeTrial = freeTrialProduct.price_options.find((p: { amount: number }) => p.amount === 0)
            if (!freeTrial) {
                addClientAlert('No free trial product found (E#2).')
                return
            }
            setInitializationStage('purchase-free-trial')
            subscription = await purchaseProduct({
                productId: freeTrialProduct.id,
                periodicity: freeTrial.periodicity,
                price: freeTrial.amount,
            })
            setPendingSubscription(subscription)
        }
        if (!subscription) {
            addClientAlert('Failed to purchase free trial (E#3).')
            setInitializationStage('none')
            return
        }
        if (signupEmail) {
            setInitializationStage('add-contact-email')
            await addContactEmail(signupEmail)
        }
        if (!hasPurchasedFreeTrial) {
            setInitializationStage('assign-subscription')
            const success = await assignSubscription(subscription.subscriptionId, signupNodeName, signupPasswordHash)
            if (success) {
                setHasPurchasedFreeTrial(true)
            }
        }
        setInitializationStage('complete')
        setLoading(false)
    }

    useEffect(() => {
        if (signupPasswordHash && signupPasswordHash !== userPasswordHash) {
            setUserPasswordHash(signupPasswordHash)
        }
    }, [signupPasswordHash])

    const isMobile = useIsMobile()
    const boxClass = classNames('flex flex-col w-full max-w-full md:max-w-screen gap-4 items-stretch rounded-xl bg-white/75 backdrop-blur-lg p-4', {
        'max-w-[600px]': !isMobile,
    });

    return (
        <div className={classNames("signup-box flex flex-col gap-8 items-stetch max-h-screen overflow-y-auto", {
            ' grow self-stretch place-items-center place-content-center': signupStage !== 'credentials',
        })}>
            {loginMode !== LoginMode.None && (
                <div className={classNames("rounded-full flex items-center gap-2 px-8 py-4", {
                    'bg-orange/10': loginMode === LoginMode.Email,
                    'bg-blue-500/10': loginMode === LoginMode.X,
                    'bg-[#627EEA]/10': loginMode === LoginMode.SIWE,
                })}>
                    {loginMode === LoginMode.SIWE ? (
                        <FaEthereum />
                    ) : loginMode === LoginMode.X ? (
                        <FaXTwitter />
                    ) : loginMode === LoginMode.Email ? (
                        <FaEnvelope />
                    ) : null}
                    <span>You're signing up with {loginMode === LoginMode.X ?
                        'X' : loginMode === LoginMode.SIWE ?
                            'Ethereum' :
                            'email'}</span>
                </div>
            )}
            {signupStage === 'credentials' && (
                <>
                    <h2 className="text-3xl self-center">Create an account</h2>
                    <div className="flex flex-col self-stretch items-stretch gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            minLength={8}
                            value={signupPassword}
                            onChange={(e) =>
                                onSignupPasswordChanged(e.target.value)
                            }
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            minLength={8}
                            value={signupConfirmPassword}
                            onChange={(e) =>
                                onSignupConfirmPasswordChanged(e.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-col self-stretch items-stretch gap-4">
                        <button
                            className="text-lg self-stretch disabled:bg-orange/80"
                            disabled={
                                signupEmail === '' ||
                                signupPassword === '' ||
                                signupConfirmPassword === '' ||
                                alertText !== ''
                            }
                            onClick={onSignupWithEmail}
                        >
                            {loading ? (
                                <FaCircleNotch className="animate-spin" />
                            ) : (
                                'Sign up'
                            )}
                        </button>
                        <div className="flex gap-4 grow self-stretch">
                            <button
                                onClick={redirectToX}
                                className="grow alt !text-black text-2xl self-stretch gap-4 items-center flex"
                            >
                                <FaXTwitter />
                            </button>
                            <button
                                onClick={onSiweSignupClick}
                                className="grow alt !text-black text-2xl self-stretch gap-4 items-center flex"
                            >
                                <FaEthereum />
                            </button>
                        </div>
                    </div>
                </>
            )}
            {signupStage === 'code' && (
                <div className={boxClass}>
                    <h3 className="text-2xl self-center">Check your email</h3>
                    <p>
                        We sent a code to {signupEmail}.<br />
                        Please check your email and enter the code below.
                    </p>
                    <input
                        type="text"
                        placeholder="Code"
                        value={signupCode}
                        className="self-stretch"
                        onChange={(e) => setSignupCode(e.target.value)}
                    />
                    <button className="text-lg self-stretch" onClick={onVerify}>
                        {loading ? (
                            <FaCircleNotch className="animate-spin" />
                        ) : (
                            'Verify'
                        )}
                    </button>
                </div>
            )}
            {signupStage === 'node-name' && (
                <div className={boxClass}>
                    <h3 className="text-2xl self-center">Choose a node name</h3>
                    <p>Your node name identifies you to the network, like a username.</p>
                    <input
                        type="text"
                        placeholder="some-sweet-moniker"
                        value={signupNodeName}
                        onChange={(e) => setSignupNodeName(e.target.value)}
                        onBlur={() => debouncedNodeNameCheck(signupNodeName)}
                    />
                    <span className="text-sm text-gray-500 text-center">
                        Node names must be at least 9 characters long,<br /> and can
                        only contain alphanumeric characters and dashes.
                    </span>
                    {nodeNameAvailable && (
                        <>
                            <button
                                className="text-lg !bg-blue-500 border-blue-200"
                                onClick={onPurchaseFreeTrial}
                                disabled={loading}
                            >
                                {loading ? <FaCircleNotch className="animate-spin" /> : 'Continue'}
                            </button>
                        </>
                    )}
                </div>
            )}
            {initializationStage !== 'none' && initializationStage !== 'complete' && (
                <StagedLoadingOverlay
                    stages={INITIALIZATION_STAGES}
                    currentStage={initializationStage}
                    finalStage="complete"
                />
            )}
            {alertText && (
                <div className="bg-red-500 text-white p-4 rounded-md">
                    {alertText}
                </div>
            )}
        </div>
    )
}
