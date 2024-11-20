import useDialSiteStore, { LoginMode } from '../store/dialSiteStore'
import { useState } from 'react'
// import { useIsMobile } from '../utilities/dimensions'
import { sha256 } from '../utilities/hash'
import { FaEthereum, FaXTwitter } from 'react-icons/fa6'
import { OPTIMISM_CHAIN_ID } from '../utilities/eth'
import { switchToOptimism } from '../utilities/eth'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'
import { loginToNode, deriveNodePassword } from '../utilities/auth'
import { NodeSelectionModal } from './NodeSelectionModal'
import { getFirstNode } from '../types/UserNode'
import ForgotPasswordModal from './ForgotPasswordModal'

export const LoginBox = () => {
    const {
        redirectToX,
        loginWithEmail,
        setLoginMode,
        getSiweNonce,
        registerSiwe,
        setSiweToken,
        addClientAlert,
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
                        const node = getFirstNode(userNodes)
                        if (node?.kinode_password) {
                            await loginToNode(node, node.kinode_password)
                        } else {
                            addClientAlert('No password found for node. Please contact support.')
                        }
                    } catch (error) {
                        addClientAlert('Failed to login to node: ' + (error as Error).message)
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
                addClientAlert('Please install MetaMask or another Ethereum wallet')
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
            if (reginResult?.jwt) {
                setSiweToken(reginResult.jwt)
                if (Object.keys(userNodes).length > 0 && userInfo?.id) {
                    try {
                        const derivedPassword = await deriveNodePassword(
                            userInfo.id.toString(),
                            'siwe'
                        );

                        if (Object.keys(userNodes).length === 1) {
                            const node = getFirstNode(userNodes)
                            if (node?.kinode_password) {
                                await loginToNode(node, node.kinode_password || derivedPassword)
                            } else {
                                addClientAlert('No password found for node. Please contact support.')
                            }
                        } else {
                            setNodeSelectionOpen(true)
                        }
                    } catch (error) {
                        addClientAlert('Failed to login to node: ' + (error as Error).message)
                    }
                }
            }
        } catch (error) {
            console.error(error)
            addClientAlert('Failed to sign in with Ethereum: ' + (error as Error).message)
        }
    }

    // const isMobile = useIsMobile()

    return (
        <>
            <div className="flex flex-col gap-4 items-center">
                <h3 className="text-2xl">Login to Dial</h3>
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
                <button
                    className="text-lg self-stretch"
                    onClick={onLoginWithEmail}
                >
                    Sign in
                </button>
                <div className="flex gap-4 grow self-stretch">
                    <button
                        onClick={redirectToX}
                        className="grow bg-blue-500 text-lg border-blue-200 self-stretch gap-4 items-center flex"
                    >
                        <FaXTwitter />
                    </button>
                    <button
                        onClick={onSiweSignInClick}
                        className="grow bg-[#627EEA] text-lg border-[#627EEA] self-stretch gap-4 items-center flex"
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
