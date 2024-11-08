import { useState } from 'react'
import useDialSiteStore from '../../store/dialSiteStore'
import Modal from '../common/Modal'

interface AddUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
    const addWhitelistedUser = useDialSiteStore(state => state.addWhitelistedUser)
    const [formData, setFormData] = useState({
        modality: 'email' as 'email' | 'phone',
        identifier: '',
        remainingKinodes: 1,
        remainingTrial: true
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const success = await addWhitelistedUser(formData)
            if (success) {
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
            title="Add New User"
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Modality
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={formData.modality}
                            onChange={e => setFormData(prev => ({ ...prev, modality: e.target.value as 'email' | 'phone' }))}
                        >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Identifier
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={formData.identifier}
                            onChange={e => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
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
                            value={formData.remainingKinodes}
                            onChange={e => setFormData(prev => ({ ...prev, remainingKinodes: parseInt(e.target.value) }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm"
                                checked={formData.remainingTrial}
                                onChange={e => setFormData(prev => ({ ...prev, remainingTrial: e.target.checked }))}
                            />
                            <span className="ml-2 text-sm text-gray-700">Has Remaining Trial</span>
                        </label>
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
                        {isSubmitting ? 'Adding...' : 'Add User'}
                    </button>
                </div>
            </form>
        </Modal>
    )
} 