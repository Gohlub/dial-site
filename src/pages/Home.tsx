import useValetStore from '../store/valetStore'
import { useEffect } from 'react'
import { UserNode } from '../types/UserNode'
import dayjs from 'dayjs'
import { Alerts } from '../components/Alerts'
import NavBar from '../components/NavBar'
import classNames from 'classnames'
import { useIsMobile } from '../utilities/dimensions'
import UserHome from '../components/UserHome'

export const Home = () => {
  const {
    redirectToX,
    getServerAlerts,
    get,
    token,
    getUserInfo,
    getUserNodes,
    serverIsUnderMaintenance,
    expectedAvailabilityDate,
    setActiveNode
  } = useValetStore()

  useEffect(() => {
    getServerAlerts()
    if (token) {
      getUserInfo()
      getUserNodes()
    }
    const intervalId = setInterval(async () => {
      await getServerAlerts()
      if (token) {
        await getUserInfo()
        await getUserNodes()
        const { userNodes, activeNode } = get()
        if (activeNode) {
          const thatNode = userNodes.find((n: UserNode) => n.id === activeNode.id)
          if (thatNode) setActiveNode(thatNode)
        }
      }
    }, 10000)

    return () => clearInterval(intervalId)
  }, [token])


  const isMobile = useIsMobile()

  return (<>
    <NavBar />
    <Alerts />
    {token && <UserHome />}
    {!token && <div className="flex grow self-stretch">
      <div className={classNames('flex flex-col m-auto place-items-center px-8 py-4 place-content-center self-stretch rounded-2xl bg-white/50 backdrop-blur-sm gap-6', {
      })}>
        <img src='/favicon.png' className='h-24 min-h-24 w-24 min-w-24' />

        <div className='text-xl'>
          Read and curate the best content from anywhere.
        </div>
        <div className='flex flex-col gap-4'>
          <input type='email' placeholder='Email' />
          <input type='password' placeholder='Password' />
          <button className='text-lg'>Sign in</button>
          <button
            className='bg-blue-500 text-lg border-blue-200'
            onClick={redirectToX}
          >
            Sign in with X
          </button>
          <div className='h-[1px] bg-black w-full' />
          <button className='text-lg alt'>Sign up</button>
        </div>
      </div>
    </div>}
    {serverIsUnderMaintenance && <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col place-items-center place-content-center'>
      <div className='text-white text-4xl'>Server is under maintenance. Please try again later.</div>
      <div className='text-white text-2xl'>Service estimated back up {expectedAvailabilityDate && dayjs(expectedAvailabilityDate * 1000).fromNow()}</div>
    </div>}
  </>)
}