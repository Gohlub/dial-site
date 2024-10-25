import useValetStore from "../store/valetStore"

export const UserCard = () => {
  const { userInfo, onSignOut } = useValetStore()
  return (
    <div className="flex items-center self-end rounded-lg bg-white/10 pl-2 mr-4">
      <div>
        <span>Signed in as</span>
        <a
          target="_blank"
          className="ml-1 font-bold"
          href={`https://x.com/${userInfo?.twitterScreenName}`}
        >
          @{userInfo?.twitterScreenName}
        </a>
      </div>
      <button
        className="clear ml-2 px-2"
        onClick={onSignOut}
      >
        Sign Out
      </button>
    </div>
  )
}