import useValetStore from "../store/valetStore"
import { Link } from "react-router-dom"

export default function NavBar() {
    const { viteMode, } = useValetStore()

    return <div className='flex items-center gap-4 p-4 self-stretch'>
        <Link to='/' className='text-white decoration-none hover:underline hover:opacity-70 font-normal'>
            <img src='/DIAL.svg' className='h-12' />
        </Link>
        <Link to='https://uncentered.systems' className='ml-auto'>
            <img src='/White Wordmark.svg' className='h-8' />
        </Link>
        {viteMode === 'production' ? <></> : viteMode === 'staging'
            ? <div className='absolute bottom-4 left-4 text-2xl font-bold text-white'>STAGING MODE</div>
            : <div className='absolute bottom-4 left-4 text-2xl font-bold text-white'>DEV MODE</div>}
    </div>
}