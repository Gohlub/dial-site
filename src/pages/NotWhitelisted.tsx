import NavBar from '../components/NavBar'
const NotWhitelisted = () => {
    return (
        <>
            <NavBar />
            <div className="flex flex-col gap-2 items-center grow place-content-center">
                <h2>Not Whitelisted</h2>
                <div>Your X account is not yet on our whitelist.</div>
                <div>
                    To get whitelisted, please sign up at{' '}
                    <a href="https://uncentered.systems/waitlist">
                        Uncentered Systems
                    </a>
                    .
                </div>
                <div>
                    If you believe this is an error, please{' '}
                    <a href="https://discord.gg/gXdG9UDPtm">
                        reach out on Discord
                    </a>{' '}
                    or <a href="/contact-us">contact us</a>.
                </div>
            </div>
        </>
    )
}

export default NotWhitelisted
