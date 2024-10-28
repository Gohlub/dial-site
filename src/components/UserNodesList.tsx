import { FaPlus } from "react-icons/fa6"
import useDialSiteStore from "../store/dialSiteStore"
import { UserNodeDisplay } from "./UserNodeDisplay"
import classNames from "classnames"


export const UserNodesList = () => {
  const { userNodes, setAddNodeModalOpen } = useDialSiteStore()
  return (
    <div
      className={classNames('flex flex-col grow place-items-center place-content-center')}
    >
      <h2 className="self-center mb-4">Your Kinodes</h2>
      <div className="flex flex-wrap gap-2">
        {userNodes?.length > 0
          ? userNodes.map(node => <UserNodeDisplay node={node} key={node.id} />)
          : <span className="self-center mb-2">You don't have any nodes yet.</span>}
        <button
          className="clear flex flex-col c"
          onClick={() => setAddNodeModalOpen(true)}
        >
          <FaPlus className="mb-2" />
          Add
        </button>
      </div>
    </div>
  )
}