import { useState, useEffect } from 'react'
import useDialSiteStore from '../../store/dialSiteStore'
import { UserInfo } from '../../types/UserInfo'
import Modal from '../common/Modal'

interface EditUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    user: UserInfo
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
    const { editWhitelistedIdentifier, editRemainingKinodes, editRemainingTrial } = useDialSiteStore()
    const [formData, setFormData] = useState({
        contact_email: user.contact_email || '',
        remaining_kinodes: user.remaining_kinodes,
        remaining_trial: user.remaining_trial
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setFormData({
            contact_email: user.contact_email || '',
            remaining_kinodes: user.remaining_kinodes,
            remaining_trial: user.remaining_trial
        })
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const promises = []
            if (formData.contact_email !== user.contact_email) {
                promises.push(editWhitelistedIdentifier(String(user.id), formData.contact_email))
            }
            if (formData.remaining_kinodes !== user.remaining_kinodes) {
                promises.push(editRemainingKinodes(String(user.id), formData.remaining_kinodes))
            }
            if (formData.remaining_trial !== user.remaining_trial) {
                promises.push(editRemainingTrial(String(user.id), formData.remaining_trial))
            }

            const results = await Promise.all(promises)
            if (results.every(Boolean)) {
                onSuccess()
                onClose()
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit User"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={formData.contact_email}
                            onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Remaining Kinodes
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={formData.remaining_kinodes}
                            onChange={e => {
                                const parsed = Math.max(0, parseInt(e.target.value) || 0)
                                setFormData(prev => ({ ...prev, remaining_kinodes: parsed }))
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm"
                                checked={formData.remaining_trial}
                                onChange={e => setFormData(prev => ({ ...prev, remaining_trial: e.target.checked }))}
                            />
                            <span className="ml-2 text-sm text-gray-700">Has Remaining Trial</span>
                        </label>
                    </div>

                    {/* Login Methods Section */}
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Connected Accounts</h3>

                        {/* Email Logins */}
                        {user.emailLogins.length > 0 && (
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Logins
                                </label>
                                <div className="space-y-1">
                                    {user.emailLogins.map((login, index) => (
                                        <div key={index} className="text-sm text-gray-500">
                                            {login.display_identifier}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SIWE Logins */}
                        {user.siweLogins.length > 0 && (
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ethereum Wallets
                                </label>
                                <div className="space-y-1">
                                    {user.siweLogins.map((login, index) => (
                                        <div key={index} className="text-sm text-gray-500 font-mono">
                                            {login.display_identifier}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* X Logins */}
                        {user.xLogins.length > 0 && (
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    X Accounts
                                </label>
                                <div className="space-y-1">
                                    {user.xLogins.map(login => (
                                        <div key={login.id} className="text-sm text-gray-500">
                                            @{login.display_identifier}
                                            <span className="text-xs text-gray-400 ml-2">
                                                (ID: {login.functional_identifier})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Connected Accounts Message */}
                        {user.emailLogins.length === 0 &&
                            user.siweLogins.length === 0 &&
                            user.xLogins.length === 0 && (
                                <div className="text-sm text-gray-500 italic">
                                    No connected accounts found
                                </div>
                            )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    )
} 