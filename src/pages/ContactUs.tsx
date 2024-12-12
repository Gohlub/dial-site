import useDialSiteStore from '../store/dialSiteStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

const NotWhitelisted = () => {
    const { submitContactRequest, addToast } = useDialSiteStore()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [msg, setMsg] = useState('')
    const onSubmit = async () => {
        const result = await submitContactRequest(name, email, msg)
        if (result.success) {
            addToast('Your message has been sent. We will get back to you soon.', 'success')
            navigate('/auth')
        } else {
            addToast(result.error as string, 'error')
        }
    }
    return (
        <>
            <NavBar />
            <div className="flex flex-col gap-4 items-center">
                <h2>Contact Us</h2>
                <div className="flex items-center gap-2">
                    <div>Name</div>
                    <input
                        type="text"
                        placeholder="Keenan Ode"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div>Email</div>
                    <input
                        type="email"
                        placeholder="keenan.ode@kinode.xyz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div>Message</div>
                    <textarea
                        placeholder="Hello, I am Keenan Ode and I am a student at the University of Waterloo."
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                    />
                </div>
                <button onClick={onSubmit}>Submit</button>
                <button onClick={() => navigate('/auth')} className="clear">
                    Cancel
                </button>
            </div>
        </>
    )
}

export default NotWhitelisted
