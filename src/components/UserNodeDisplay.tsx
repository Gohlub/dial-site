import { UserNode } from "../types/UserNode"
import useDialSiteStore from "../store/dialSiteStore"
import classNames from "classnames"
import { useEffect } from "react"
import { FaGear } from "react-icons/fa6"

export const UserNodeDisplay: React.FC<{ node: UserNode }> = ({ node }) => {
  const { userNodes, activeNode, setActiveNode } = useDialSiteStore()
  useEffect(() => {
    if (activeNode && !userNodes.find(n => n.id === activeNode?.id)) {
      setActiveNode(null)
    } else {
      const updated = userNodes.find(n => n.id === activeNode?.id)
      if (updated) {
        setActiveNode(updated)
      }
    }
  }, [userNodes, activeNode, setActiveNode])

  return <div
    className={classNames("flex flex-col items-center self-stretch rounded rounded-md p-2", {
      'bg-white/25': activeNode && activeNode.id === node.id,
      'bg-green/25': !activeNode || activeNode.id !== node.id,
    })}
  >
    <a
      href={node.link.startsWith('http') ? node.link : ''}
      className="mb-2"
    >
      <h3
        className="grow p-3 cursor-pointer hover:bg-white/35 rounded bg-green/25"
      >{node.kinode_name}.os</h3>
    </a>
    <div className="flex c">
      <button
        className="icon"
        onClick={() => setActiveNode(node)}
      >
        <FaGear />
      </button>
    </div>
  </div>
}

