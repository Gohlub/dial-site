import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
import { useState } from 'react'
// import { useIsMobile } from '../utilities/dimensions'
import { sha256 } from '../utilities/hash'
import { FaEthereum, FaXTwitter } from 'react-icons/fa6'
import { OPTIMISM_CHAIN_ID } from '../utilities/eth'
import { switchToOptimism } from '../utilities/eth'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'
import { loginToNode, deriveNodePassword, doesNodeHaveDialInstalled } from '../utilities/auth'
import { NodeSelectionModal } from './NodeSelectionModal'
import { getFirstDialNode } from '../types/UserNode'
import ForgotPasswordModal from './ForgotPasswordModal'

export const LoginBox = () => {
    const {
        redirectToX,
        loginWithEmail,
        setLoginMode,
        getSiweNonce,
        registerSiwe,
        setSiweToken,
        addToast,
        getNodeDetails,
        userNodes,
        userInfo,
        setLoadingStage,
    } = useDialSiteStore()

    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginPasswordHash, setLoginPasswordHash] = useState('')
    const [nodeSelectionOpen, setNodeSelectionOpen] = useState(false)
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

    const onLoginPasswordChanged = async (password: string) => {
        setLoginPassword(password)
        const hashHex = await sha256(password)
        setLoginPasswordHash(hashHex)
    }

    const onLoginWithEmail = async () => {
        setLoginMode(LoginMode.Email)
        setLoadingStage('kinode')
        const success = await loginWithEmail(loginEmail, loginPasswordHash)
        if (success) {
            if (Object.keys(userNodes).length > 0) {
                if (Object.keys(userNodes).length === 1) {
                    try {
                        const node = getFirstDialNode(userNodes)
                        if (node?.kinode_password) {
                            await loginToNode(node, node.kinode_password)
                        } else {
                            const thatNode = userNodes[Object.keys(userNodes)[0] as any]
                            const deets = await getNodeDetails(thatNode.id);
                            thatNode.kinode_password ||= deets?.kinode_password
                            if (thatNode.kinode_password) {
                                await loginToNode(thatNode, thatNode.kinode_password)
                            } else {
                                addToast('No password found for node. Please contact support.')
                            }
                        }
                    } catch (error) {
                        addToast('Failed to login to node: ' + (error as Error).message)
                    }
                } else {
                    setNodeSelectionOpen(true)
                }
            } else {
                // user has no nodes yet
                setLoadingStage()
            }
        } else {
            // login failed
            setLoadingStage()
        }
    }

    const onSiweSignInClick = async () => {
        setLoginMode(LoginMode.SIWE)
        try {
            console.log('checking ethereum')
            if (!(window as any).ethereum) {
                addToast('Please install MetaMask or another Ethereum wallet')
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

            const reginResult = await registerSiwe(messageToSign, signature)
            if (!reginResult?.jwt) {
                addToast('Failed to sign in with Ethereum. Please try again.')
                return
            }

            setSiweToken(reginResult.jwt)
            if (!userInfo?.id) {
                addToast('No user ID found. Please contact support.')
                return
            }

            try {
                const derivedPassword = await deriveNodePassword(
                    userInfo.id.toString(),
                    'siwe'
                );

                if (Object.keys(userNodes).length === 1) {
                    const node = getFirstDialNode(userNodes)
                    if (node) {
                        await loginToNode(node, node.kinode_password || derivedPassword)
                    } else if ((await doesNodeHaveDialInstalled(userNodes[Object.keys(userNodes)[0] as any]))) {
                        const thatNode = userNodes[Object.keys(userNodes)[0] as any]
                        const deets = await getNodeDetails(thatNode.id);
                        thatNode.kinode_password ||= deets?.kinode_password
                        await loginToNode(thatNode, thatNode.kinode_password || derivedPassword)
                    } else {
                        addToast('No password found for node. Please contact support.')
                    }
                } else {
                    setNodeSelectionOpen(true)
                }
            } catch (error) {
                addToast('Failed to login to node: ' + (error as Error).message)
            }
        } catch (error) {
            console.error(error)
            addToast('Failed to sign in with Ethereum: ' + (error as Error).message)
        }
    }

    // const isMobile = useIsMobile()

    return (
        <>
            <div className="login-box flex flex-col gap-8 items-stetch max-h-screen overflow-y-auto">
                <h2 className="self-center text-3xl">Login to Dial</h2>
                <div className="flex flex-col self-stretch items-stretch gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => onLoginPasswordChanged(e.target.value)}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                onLoginWithEmail()
                            }
                        }}
                    />
                </div>
                <div className="flex flex-col self-stretch items-stretch gap-4">
                    <button
                        className="text-lg self-stretch"
                        onClick={onLoginWithEmail}
                    >
                        Sign in
                    </button>
                    <div className="flex gap-4 grow self-stretch">
                        <button
                            onClick={redirectToX}
                            className="grow alt !text-black text-2xl self-stretch gap-4 items-center flex"
                        >
                            <FaXTwitter />
                        </button>
                        <button
                            onClick={onSiweSignInClick}
                            className="grow alt !text-black text-2xl self-stretch gap-4 items-center flex"
                        >
                            <FaEthereum />
                        </button>
                    </div>
                    <button
                        className="text-lg self-stretch alt"
                        onClick={() => setForgotPasswordOpen(true)}
                    >
                        Forgot Password?
                    </button>
                </div>
            </div>
            <ForgotPasswordModal
                isOpen={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
            />
            <NodeSelectionModal
                isOpen={nodeSelectionOpen}
                onClose={() => setNodeSelectionOpen(false)}
                nodes={Object.values(userNodes)}
                passwordHash={loginPasswordHash}
            />
        </>
    )
}
