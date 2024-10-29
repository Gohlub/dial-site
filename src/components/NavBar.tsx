import useDialSiteStore from '../store/dialSiteStore'
import { Link } from 'react-router-dom'

export default function NavBar() {
    const { viteMode } = useDialSiteStore()

    return (
        <div className="flex items-center gap-4 p-4 self-stretch bg-white shadow-xl">
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
                <div className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    STAGING MODE
                </div>
            ) : (
                <div className="absolute bottom-4 left-4 text-2xl font-bold text-fuchsia-500 z-50">
                    DEV MODE
                </div>
            )}
        </div>
    )
}
