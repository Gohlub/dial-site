import useDialSiteStore from '../store/dialSiteStore'
import { useState } from 'react'
import { useIsMobile } from '../utilities/dimensions'
import { sha256 } from '../utilities/hash'
import { FaXTwitter } from 'react-icons/fa6'

export const LoginBox = () => {
    const { redirectToX, loginWithEmail } = useDialSiteStore()

    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginPasswordHash, setLoginPasswordHash] = useState('')

    const onLoginPasswordChanged = async (password: string) => {
        setLoginPassword(password)
        const hashHex = await sha256(password)
        setLoginPasswordHash(hashHex)
    }

    const isMobile = useIsMobile()

    return (
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
            />
            <button
                className="text-lg self-stretch"
                onClick={() => loginWithEmail(loginEmail, loginPasswordHash)}
            >
                Sign in
            </button>
            <button
                onClick={redirectToX}
                className="bg-blue-500 text-lg border-blue-200 self-stretch gap-4 items-center flex"
            >
                <FaXTwitter />
                <span className="text-white">Sign in with X</span>
            </button>
        </div>
    )
}
