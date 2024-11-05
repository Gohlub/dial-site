import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
import { useCallback, useEffect, useState } from 'react'
import { useIsMobile } from '../utilities/dimensions'
import { sha256 } from '../utilities/hash'
import { FaCircleNotch } from 'react-icons/fa'
import { FaEnvelope, FaEthereum, FaXTwitter } from 'react-icons/fa6'
import classNames from 'classnames'
import { debounce } from '../utilities/debounce'

export const SignupBox = () => {
    const {
        registerEmail,
        verifyEmail,
        setLoadingStage,
        redirectToX,
        checkIsNodeAvailable,
        bootNode,
        checkProducts,
        purchaseProduct,
        addContactEmail,
        assignSubscription,
        getUserNodes,
        addClientAlert,
        getSiweNonce,
        siweNonce,
        loginMode,
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
            setSignupStage('code')
            return
        }
        setAlertText(
            'Failed to register email. Please try again or contact admin@uncentered.systems if issues persist.',
        )
    }

    const onVerify = async () => {
        setLoading(true)
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

    useEffect(() => {
        if (signupStage === 'credentials' && loginMode === LoginMode.X) {
            setSignupStage('node-name')
        }
    }, [loginMode])

    useEffect(() => {
        if (signupPassword !== signupConfirmPassword) {
            setAlertText('Passwords do not match')
        } else {
            setAlertText('')
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

    const onBootNode = async () => {
        if (signupPassword.length < 8 || signupPasswordHash !== signupConfirmPasswordHash)
            return alert(
                'Password must be at least 8 characters long, and passwords must match.',
            )
        setLoading(true)
        const { success, error } = await bootNode(signupNodeName, signupPasswordHash)
        if (success) {
            setSignupStage('await-boot')
            setLoadingStage('preload')
            getUserNodes()
        } else {
            alert(`Something went wrong: ${error}. Please try again.`)
        }
        setLoading(false)
        console.log({ success, error })
    }

    const onPurchaseFreeTrial = async () => {
        const products = await checkProducts('en')
        console.log({ products })
        const freeTrialProduct = products.find(p => p.title === 'Dial Subscription')
        if (!freeTrialProduct) {
            addClientAlert('No free trial product found (E#1).')
            return
        }
        const freeTrial = freeTrialProduct.price_options.find(p => p.amount === 0)
        if (!freeTrial) {
            addClientAlert('No free trial product found (E#2).')
            return
        }
        const subscription = await purchaseProduct({
            productId: freeTrialProduct.id,
            periodicity: freeTrial.periodicity,
            price: freeTrial.amount,
        })
        if (!subscription) {
            addClientAlert('Failed to purchase free trial (E#3).')
            return
        }
        if (signupEmail) {
            await addContactEmail(signupEmail)
        }
        await assignSubscription(subscription.subscriptionId, signupNodeName, signupPasswordHash)
        await onBootNode()
        setLoading(false)
    }

    const onSiweSignupClick = async () => {
        const nonce = await getSiweNonce()
        console.log({ nonce })
    }

    const isMobile = useIsMobile()
    const boxClass = classNames('flex flex-col gap-2 place-items-center rounded-xl bg-white/50 backdrop-blur-lg p-4', {
        'max-w-screen': isMobile,
        'max-w-[700px]': !isMobile,
    });

    return (
        <div className={classNames("flex flex-col md:gap-4 gap-2 items-center max-h-screen overflow-y-auto", {
            ' grow self-stretch place-items-center place-content-center': signupStage !== 'credentials',
        })}>
            {loginMode !== LoginMode.None && (
                <div className={classNames("text-white text-xl flex items-center gap-2 rounded-xl p-4", {
                    'bg-white/10': loginMode === LoginMode.Email,
                    'bg-blue-500': loginMode === LoginMode.X,
                    'bg-[#627EEA]': loginMode === LoginMode.SIWE,
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
                <div className={boxClass}>
                    <h3 className="text-2xl">Create an account</h3>
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
                    <button
                        className="text-lg self-stretch"
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
                    <h4> Single Sign-On </h4>
                    <button
                        onClick={redirectToX}
                        className="bg-blue-500 text-lg border-blue-200 self-stretch gap-4 items-center flex"
                    >
                        <FaXTwitter />
                        <span className="text-white">Sign up with X</span>
                    </button>
                    <button
                        onClick={onSiweSignupClick}
                    >
                        <FaEthereum />
                        <span className="text-white">Sign up with Ethereum</span>
                    </button>
                    {siweNonce && (
                        <div className="text-sm text-gray-500">
                            Nonce: {siweNonce}
                        </div>
                    )}
                </div>
            )}
            {signupStage === 'code' && (
                <div className={boxClass}>
                    <h3>Check your email</h3>
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
                    <h3>Choose a node name</h3>
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
            {alertText && (
                <div className="bg-red-500 text-white p-4 rounded-md">
                    {alertText}
                </div>
            )}
        </div>
    )
}
