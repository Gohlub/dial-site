import useDialSiteStore from '../store/dialSiteStore'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHubspot } from 'react-icons/fa'

export default function NavBar() {
    const navigate = useNavigate()
    const { viteMode, addToast } = useDialSiteStore()

    const nukeButton = <button onClick={() => {
        localStorage.clear();
        sessionStorage.clear();
        addToast('Storage cleared')
    }}>Clear storage</button>

    return (
        <div className="flex items-center gap-4 p-4 self-stretch bg-white shadow-xl z-60">
            <Link
                to="/"
                className="decoration-none hover:underline hover:opacity-70 font-normal"
            >
                <img src="/DIAL.svg" className="h-8" />
            </Link>
            <span className="self-stretch bg-orange w-[1px]"></span>
            <Link to="https://uncentered.systems" className="">
                <img src="/Orange Wordmark.svg" className="h-8" />
            </Link>

            <span className="flex-1">
                {/* JE SUIS LE GROS SPAN! NE PAS TOUCHER! */}
            </span>

            <motion.button
                onClick={() => navigate('/')}
                className="px-6 py-2 text-lg font-medium text-orange border-2 border-orange rounded-full
                    hover:bg-gradient-to-r hover:from-orange hover:to-black
                    hover:text-white transition-all duration-30
                    shadow-md hover:shadow-lg
                    bg-black/80
                    transform hover:scale-105
                    flex items-center gap-2"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                <FaHubspot className="text-xl" />
                Holoscope
            </motion.button>

            <button
                className="alt text-lg"
                onClick={() => navigate('/auth')}
            >
                Sign up
            </button>
            <button
                onClick={() => navigate('/auth')}
                className="text-lg"
            >
                Log in
            </button>
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
