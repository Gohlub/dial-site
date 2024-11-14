import Modal from './common/Modal'
import { UserNode } from '../types/UserNode'
import { loginToNode } from '../utilities/auth'
import useDialSiteStore from '../store/dialSiteStore'

interface NodeSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    nodes: UserNode[]
    passwordHash: string
}

export const NodeSelectionModal = ({ isOpen, onClose, nodes, passwordHash }: NodeSelectionModalProps) => {
    const { addClientAlert } = useDialSiteStore()

    const handleNodeSelection = async (node: UserNode) => {
        try {
            await loginToNode(node, passwordHash)
        } catch (error) {
            addClientAlert('Failed to login to node: ' + (error as Error).message)
        }
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Node"
        >
            <div className="flex flex-col flex-wrap gap-4">
                <p className="text-gray-600">Please select which node you'd like to log into:</p>
                {nodes.map((node) => (
                    <button
                        key={node.id}
                        onClick={() => handleNodeSelection(node)}
                        className="text-lg p-4 border rounded-lg hover:bg-gray-50"
                    >
                        {node.kinode_name}
                    </button>
                ))}
            </div>
        </Modal>
    )
} 