import { FaArrowRotateRight, FaArrowUpRightFromSquare, FaCopy, FaEye, FaEyeSlash } from "react-icons/fa6";
import { UserNode } from "../types/UserNode";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import classNames from "classnames";
import { useState } from "react";
import useValetStore from "../store/valetStore";
import { Modal } from "./Modal";
import Chip from "./Chip";
dayjs.extend(relativeTime)

export const NodeDetailsModal: React.FC<{ node: UserNode }> = ({ node }) => {
  const { setActiveNode, setResetPasswordModalOpen } = useValetStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { onRegenerateSshPassword } = useValetStore()
  const regenerateSshPassword = async () => {
    if (!window.confirm(`Are you sure you want to regenerate the SSH password for ${node.kinode_name}.os?`)) {
      return
    }
    await onRegenerateSshPassword(node)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return <Modal
    onClose={() => setActiveNode(null)}
    title={`${node.kinode_name}.os`}
  >
    <div className="flex items-center flex-wrap gap-2">
      <Chip
        className={classNames({
          '!bg-green': node.ship_status === 'active'
        })}
        text={`status: ${node.ship_status}`}
      />
      <Chip
        text={`last automated restart ${dayjs(node.last_restarted).fromNow()}`}
      />
      <Chip
        text={`payment ${node.payment_status.toLocaleLowerCase()}`}
      />
    </div>
    {node.email && <div>Admin email: {node.email}</div>}
    <div
      className="flex flex-col place-items-center place-content-center self-center grow self-stretch gap-2"
    >
      <span className="">Created: {dayjs(node.created_at).format('D MMM YYYY HH:mm:ss')} ({dayjs(node.created_at).fromNow()})</span>
      <span>Product: {node.product_title} - {node.product_description}</span>
      <div className="flex">
        <span>Web Login:</span>
        <a
          href={node.link}
          target="_blank"
          className={classNames("flex items-center ml-2 font-bold", { 'pointer-events-none': !node.link.startsWith('http') })}
        >
          {node.link.startsWith('http') ? node.link : '(pending)'}
          <FaArrowUpRightFromSquare className="text-[10px] ml-2" />
        </a>
      </div>
      {showAdvanced ? <button
        className="clear"
        onClick={() => setShowAdvanced(false)}
      >Hide advanced details</button> : <button
        className="clear"
        onClick={() => setShowAdvanced(true)}
      >Show advanced details</button>}
      {showAdvanced && node.ssh_password && <div className="flex flex-col gap-2">
        <div className="flex c">
          <span>SSH Address:</span>
          <span className="font-mono text-xs">{node.ssh_username}@{node.ssh_address}</span>
          <button
            className="icon"
            onClick={() => copyToClipboard(`${node.ssh_username}@${node.ssh_address}`)}
          >
            <FaCopy />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>SSH Password:</span>
          <span className="font-mono text-xs">
            {showPassword ? node.ssh_password : '******' + (node.ssh_password || '').slice(-2)}
          </span>
          <button
            className="icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          <button
            className="icon"
            onClick={() => copyToClipboard(node.ssh_password)}
          >
            <FaCopy />
          </button>
          <button
            className="icon"
            onClick={regenerateSshPassword}
          >
            <FaArrowRotateRight />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Local HTTP Port:</span>
          <span className="font-mono text-xs">{node.local_http_port}</span>
          <button
            className="icon"
            onClick={() => copyToClipboard(node.local_http_port)}
          >
            <FaCopy />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Reset node login password:</span>
          <button
            className="clear"
            onClick={() => setResetPasswordModalOpen(true)}
          >
            Reset
          </button>
        </div>
      </div>}
    </div>
  </Modal>
}

