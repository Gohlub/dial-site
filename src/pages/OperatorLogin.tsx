import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useDialSiteStore from '../store/dialSiteStore'
import { sha256 } from '../utilities/hash'
import { prepend0x } from '../utilities/auth'

const OperatorLogin = () => {
    const { operatorToken, setOperatorToken } = useDialSiteStore(state => ({
        operatorToken: state.operatorToken,
        setOperatorToken: state.setOperatorToken
    }))
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const response = await axios.post('/api/operator/login', {
                email,
                password: prepend0x(await sha256(password))
            })

            if (response.status === 200) {
                // Store the token in localStorage
                setOperatorToken(response.data.token)
            }
        } catch (error) {
            setError('Invalid credentials. Please try again.')
            console.error('Login failed:', error)
        }
    }

    useEffect(() => {
        if (operatorToken) {
            navigate('/operator/dashboard', { replace: true })
        }
    }, [operatorToken, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Operator Login
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Sign in
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Back
                    </button>
                </form>
            </div>
        </div>
    )
}

export default OperatorLogin