import { useEffect, useState } from 'react'
import useDialSiteStore from '../store/dialSiteStore'
import { Modal } from './Modal'
import { sha256 } from '../utilities/hash'
import { useIsMobile } from '../utilities/dimensions'
import classNames from 'classnames'

enum AddNodeStage {
    CheckAvailability = 1,
    ChoosePassword = 2,
    Boot = 3,
}

export const AddNodeModal = () => {
    const {
        setAddNodeModalOpen,
        checkIsNodeAvailable,
        bootNode,
        getUserNodes,
        userNodes,
        userInfo,
    } = useDialSiteStore()
    const [nodeName, setNodeName] = useState('')
    const [stage, setStage] = useState(AddNodeStage.CheckAvailability)
    const [available, setAvailable] = useState<boolean | null>(null)
    const [passwordHash, setPasswordHash] = useState<string>('')
    const [confirmPasswordHash, setConfirmPasswordHash] = useState<string>('')
    const [password, setPassword] = useState('')
    const [kinodesRemaining, setKinodesRemaining] = useState(0)

    const onNodeNameChanged = (name: string) => {
        setAvailable(null)
        setStage(AddNodeStage.CheckAvailability)
        setNodeName(name.replace(/\./g, '').replace(/\s/g, '').toLowerCase())
    }

    const onCheckAvailable = async () => {
        if (nodeName === '') return alert('Please enter a node name.')
        if (nodeName.length < 9)
            return alert('Node name must be at least 9 characters long.')
        if (!nodeName.match(/^[a-z0-9-]+$/))
            return alert('Node name must be alphanumeric, with dashes allowed.')
        let isAvail = await checkIsNodeAvailable(nodeName)
        setAvailable(isAvail)
        if (isAvail) {
            setStage(AddNodeStage.ChoosePassword)
        } else {
            setStage(AddNodeStage.CheckAvailability)
        }
    }

    const onPasswordChanged = async (password: string) => {
        setPassword(password)
        const hashHex = await sha256(password)
        setPasswordHash(hashHex)
    }

    const onConfirmPasswordChanged = async (password: string) => {
        const hashHex = await sha256(password)
        setConfirmPasswordHash(hashHex)
    }

    const onBootNode = async () => {
        if (password.length < 8 || passwordHash !== confirmPasswordHash)
            return alert(
                'Password must be at least 8 characters long, and passwords must match.',
            )
        setStage(AddNodeStage.Boot)
        const { success, error } = await bootNode(nodeName, passwordHash)
        if (success) {
            await getUserNodes()
            setAddNodeModalOpen(false)
        } else {
            setStage(AddNodeStage.ChoosePassword)
            setPasswordHash('')
            setConfirmPasswordHash('')
            alert(`Something went wrong: ${error}. Please try again.`)
        }
        console.log({ success, error })
    }

    useEffect(() => {
        const n = Number(userInfo?.maxKinodes) - userNodes.length
        if (!isNaN(n)) {
            setKinodesRemaining(n)
        }
    }, [userNodes, userInfo])

    const isMobile = useIsMobile()

    return (
        <Modal
            title="Add a new node"
            onClose={() => setAddNodeModalOpen(false)}
        >
            <span className="text-sm">
                {kinodesRemaining} / {userInfo?.maxKinodes} nodes remaining
            </span>
            {kinodesRemaining <= 0 ? (
                <>
                    <div className="flex flex-col self-stretch text-center place-items-center place-content-center gap-2">
                        <span>
                            Your account has claimed its free node
                            {userNodes.length > 1 ? 's' : ''}.
                        </span>
                        <span>
                            To manage additional nodes, please contact Kinode
                            support:{' '}
                            <a href="mailto:admin@kinode.com">
                                admin@kinode.com
                            </a>
                            .
                        </span>
                    </div>
                </>
            ) : (
                <>
                    <div
                        className={classNames(
                            'flex place-items-center place-content-center',
                            { 'flex-wrap': isMobile },
                        )}
                    >
                        <span className="self-center mr-2">Node name:</span>
                        <input
                            type="text"
                            value={nodeName}
                            onChange={(e) => onNodeNameChanged(e.target.value)}
                            placeholder="some-sweet-moniker"
                        />
                        <span className="mr-2">.os</span>
                        <button
                            onClick={() => onCheckAvailable()}
                            disabled={
                                stage !== AddNodeStage.CheckAvailability ||
                                nodeName === ''
                            }
                        >
                            {stage === AddNodeStage.CheckAvailability
                                ? 'Check availability'
                                : 'Available'}
                        </button>
                    </div>
                    {available === false && (
                        <div className="my-2 self-center">
                            Name not available.
                        </div>
                    )}
                    {stage === AddNodeStage.ChoosePassword && (
                        <div className="flex flex-col border border-white border-b-0 border-l-0 border-r-0 mt-4">
                            <div className="self-center my-2">
                                Choose a strong password for {nodeName}.os.
                            </div>
                            <div className="flex">
                                <input
                                    type="password"
                                    onChange={(e) =>
                                        onPasswordChanged(e.target.value)
                                    }
                                    placeholder="password"
                                    className="grow"
                                />
                                <input
                                    type="password"
                                    onChange={(e) =>
                                        onConfirmPasswordChanged(e.target.value)
                                    }
                                    placeholder="confirm password"
                                    className="grow"
                                />
                            </div>
                            {password.length < 8 && (
                                <div className="my-2 self-center">
                                    Password must be at least 8 characters long.
                                </div>
                            )}
                            {passwordHash !== confirmPasswordHash ||
                            passwordHash === '' ||
                            confirmPasswordHash === '' ? (
                                <div className="my-2 self-center">
                                    Passwords do not match.
                                </div>
                            ) : (
                                <button
                                    onClick={() => onBootNode()}
                                    className="mt-2"
                                >
                                    Boot node
                                </button>
                            )}
                        </div>
                    )}
                    {stage === AddNodeStage.Boot && (
                        <div className="flex flex-col">
                            <div className="self-center">
                                Booting {nodeName}...
                            </div>
                        </div>
                    )}
                </>
            )}
        </Modal>
    )
}
