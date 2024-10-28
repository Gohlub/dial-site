import useDialSiteStore from "../store/dialSiteStore";
import { AddNodeModal } from "./AddNodeModal";
import { NodeDetailsModal } from "./NodeDetailsModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { UserCard } from "./UserCard";
import { UserNodesList } from "./UserNodesList";

export default function UserHome() {
    const { activeNode, addNodeModalOpen, resetPasswordModalOpen, } = useDialSiteStore()

    const resetEverything = () => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
    }

    return (<>
        <UserCard />
        <UserNodesList />
        <button
            className='clear'
            onClick={resetEverything}
        >
            Clear local data
        </button>
        {activeNode && <NodeDetailsModal node={activeNode} />}
        {addNodeModalOpen && <AddNodeModal />}
        {resetPasswordModalOpen && <ResetPasswordModal />}
    </>)
}