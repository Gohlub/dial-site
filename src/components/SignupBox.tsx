import useDialSiteStore from '../store/dialSiteStore'
import { useEffect, useState } from 'react'
import { useIsMobile } from '../utilities/dimensions'
import { sha256 } from '../utilities/hash'
import { FaCircleNotch } from 'react-icons/fa'
import StagedLoadingOverlay from './StagedLoadingOverlay'

export const SignupBox = () => {
    const {
        registerEmail,
        verifyEmail,
        getUserNodes,
    } = useDialSiteStore()
    const [loading, setLoading] = useState(false)
    const [shouldPollUserNodes, setShouldPollUserNodes] = useState(false)
    const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
    const [signupStage, setSignupStage] = useState<'credentials' | 'code' | 'complete'>('credentials')
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [signupPasswordHash, setSignupPasswordHash] = useState('')
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
    const [signupConfirmPasswordHash, setSignupConfirmPasswordHash] = useState('')
    const [signupCode, setSignupCode] = useState('')
    const [alertText, setAlertText] = useState('')

    const onSignupPasswordChanged = async (password: string) => {
        setSignupPassword(password)
        const hashHex = await sha256(password)
        setSignupPasswordHash(hashHex)
    };

    const onSignupConfirmPasswordChanged = async (password: string) => {
        setSignupConfirmPassword(password)
        const hashHex = await sha256(password)
        setSignupConfirmPasswordHash(hashHex)
    };

    const onSignup = async () => {
        setLoading(true)
        if (signupPassword !== signupConfirmPassword) {
            setAlertText('Passwords do not match')
            return
        }
        setAlertText('')
        const result = await registerEmail(signupEmail, signupConfirmPasswordHash)
        setLoading(false)
        if (result) {
            setSignupStage('code')
            return
        }
        setAlertText('Failed to register email. Please try again or contact admin@uncentered.systems if issues persist.')
    }

    const onVerify = async () => {
        setLoading(true)
        const result = await verifyEmail(signupEmail, signupPasswordHash, signupCode)
        setLoading(false)
        if (result) {
            setSignupStage('complete')
        }
    }

    useEffect(() => {
        if (signupPassword !== signupConfirmPassword) {
            setAlertText('Passwords do not match')
        } else {
            setAlertText('')
        }
    }, [signupPassword, signupConfirmPassword])

    useEffect(() => {
        if (signupStage === 'complete') {
            setShouldPollUserNodes(true)
        }
    }, [signupStage])

    useEffect(() => {
        if (shouldPollUserNodes && !pollInterval) {
            const interval = setInterval(() => {
                getUserNodes().then((nodes) => {
                    console.log({ nodes })
                })
            }, 1000)
            setPollInterval(interval)
        }
    }, [shouldPollUserNodes])

    const isMobile = useIsMobile()

    return <div className='flex flex-col gap-4'>
        {signupStage === 'credentials' && <>
            <h3>Sign up with email</h3>
            <input
                type='email'
                placeholder='Email'
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
            />
            <input
                type='password'
                placeholder='Password'
                value={signupPassword}
                onChange={(e) => onSignupPasswordChanged(e.target.value)}
            />
            <input
                type='password'
                placeholder='Confirm Password'
                value={signupConfirmPassword}
                onChange={(e) => onSignupConfirmPasswordChanged(e.target.value)}
            />
            {alertText && <div className='text-red-500'>{alertText}</div>}
            <button
                className='text-lg'
                disabled={signupEmail === '' || signupPassword === '' || signupConfirmPassword === '' || alertText !== ''}
                onClick={onSignup}
            >
                {loading ? <FaCircleNotch className='animate-spin' /> : 'Sign up'}
            </button>
        </>}
        {signupStage === 'code' && <>
            <h3>Check your email</h3>
            <p>We sent a code to {signupEmail}.<br />Please check your email and enter the code below.</p>
            <input
                type='text'
                placeholder='Code'
                value={signupCode}
                onChange={(e) => setSignupCode(e.target.value)}
            />
            <button
                className='text-lg'
                onClick={onVerify}
            >
                {loading ? <FaCircleNotch className='animate-spin' /> : 'Verify'}
            </button>
        </>}
        {signupStage === 'complete' && <>
            <StagedLoadingOverlay />
        </>}
    </div>
}