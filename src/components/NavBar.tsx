import useDialSiteStore from '../store/dialSiteStore'
import { Link } from 'react-router-dom'

export default function NavBar() {
    const { viteMode, addClientAlert } = useDialSiteStore()

    const nukeButton = <button onClick={() => {
        localStorage.clear();
        sessionStorage.clear();
        addClientAlert('Storage cleared')
    }}>Clear storage</button>

    return (
        <div className="flex items-center gap-4 p-4 self-stretch bg-white shadow-xl z-60">
            <Link
                to="/"
                className="px-4 py-2 decoration-none hover:underline hover:opacity-70 font-normal"
            >
                <img src="/DIAL.svg" className="h-12" />
            </Link>
            <Link to="https://uncentered.systems" className="ml-auto px-4 py-2 bg-orange rounded-lg shadow-sm">
                <img src="/White Wordmark.svg" className="h-8" />
            </Link>
            {viteMode === 'production' ? (
                <></>
            ) : viteMode === 'staging' ? (
                <div className="flex gap-2 absolute bottom-4 left-4 text-3xl font-black text-white z-50 animate-pulse bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] transform hover:scale-110 transition-all duration-300 cursor-pointer rounded-xl border-4 border-yellow-300 border-opacity-50 p-2">
                    🚧 STAGING MODE 🚧
                    {nukeButton}
                </div>
            ) : (
                <div className="flex gap-2 absolute bottom-4 left-4 text-3xl font-black text-fuchsia-500 z-50 animate-bounce bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] transform hover:scale-110 transition-all duration-300 cursor-pointer">
                    ✨ DEV MODE ✨
                    {nukeButton}
                </div>
            )}
        </div>
    )
}
