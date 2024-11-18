import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AddUserModal from '../components/operator/AddUserModal'
import EditUserModal from '../components/operator/EditUserModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import useDialSiteStore from '../store/dialSiteStore'
import { UserInfo } from '../types/UserInfo'

export default function OperatorDashboard() {
    const navigate = useNavigate()
    const {
        deleteWhitelistedUser,
        operatorLogout,
        searchActiveUser,
        searchWhitelistedUser,
        searchUserById,
    } = useDialSiteStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [users, setUsers] = useState<UserInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [searchModality, setSearchModality] = useState<'email' | 'phone' | 'id'>('email')

    const searchUser = async () => {
        if (!searchTerm.trim()) {
            toast.warn('Please enter a search term')
            return
        }

        setIsLoading(true)
        try {
            if (searchModality === 'id' && /^\d+$/.test(searchTerm)) {
                const userById = await searchUserById(searchTerm)
                setUsers(userById ? [userById] : [])
            } else if (searchModality === 'email') {
                const [activeUsers, whitelistedUsers] = await Promise.all([
                    searchActiveUser(searchTerm),
                    searchWhitelistedUser(searchTerm)
                ])

                const combinedUsers = [...activeUsers, ...whitelistedUsers]
                const uniqueUsers = Array.from(
                    new Map(combinedUsers.map(user => [user.id, user])).values()
                )
                setUsers(uniqueUsers)
            } else if (searchModality === 'phone') {
                toast.warn('Phone search is not supported yet')
                // const phoneUsers = await searchPhoneUser(searchTerm)
                // setUsers(phoneUsers)
            }

            if (users.length === 0) {
                toast.info('No users found')
            }
        } catch (error) {
            toast.error('Error searching for users')
            setUsers([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (confirmed: boolean) => {
        if (!confirmed || !userToDelete) {
            setDeleteConfirmOpen(false)
            setUserToDelete(null)
            return
        }

        try {
            const success = await deleteWhitelistedUser(userToDelete)
            if (success) {
                toast.success('User deleted successfully')
                setUsers([])
                setSearchTerm('')
            }
        } catch (error) {
            toast.error('Failed to delete user')
        }
        setDeleteConfirmOpen(false)
        setUserToDelete(null)
    }

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchUser()
        }
    }

    const handleRefresh = () => {
        if (searchTerm) {
            searchUser()
        }
    }

    const handleLogout = () => {
        operatorLogout()
        navigate('/operator/login')
        toast.success('Logged out successfully')
    }

    console.log({ users })

    return (
        <div className="min-h-screen flex flex-col operator-dashboard">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Operator Dashboard
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 bg-white rounded-lg p-4 shadow">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Whitelist Management
                        </h2>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add New User
                        </button>
                    </div>

                    {/* Search Section */}
                    <div className="flex gap-4 mb-6 bg-white rounded-lg p-4 shadow">
                        <input
                            type="text"
                            placeholder="Search by email or phone"
                            className="flex-1 p-2 border rounded"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                        />
                        <select
                            value={searchModality}
                            onChange={(e) => setSearchModality(e.target.value as 'email' | 'phone' | 'id')}
                        >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="id">ID</option>
                        </select>
                        <button
                            onClick={searchUser}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading || !users}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {/* Results Table */}
                    {users.length > 0 && (
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            X Handle
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Remaining Kinodes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trial Available
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.contact_email || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.xLogins?.[0]?.display_identifier || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.remaining_kinodes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.remaining_trial ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.remaining_trial ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setIsEditModalOpen(true)
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUserToDelete(String(user.id))
                                                        setDeleteConfirmOpen(true)
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AddUserModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={handleRefresh}
                />

                {selectedUser && (
                    <EditUserModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false)
                            setSelectedUser(null)
                        }}
                        onSuccess={handleRefresh}
                        user={selectedUser}
                    />
                )}

                <ConfirmDialog
                    isOpen={deleteConfirmOpen}
                    onClose={() => handleDelete(false)}
                    onConfirm={() => handleDelete(true)}
                    title="Confirm Delete"
                    message="Are you sure you want to delete this user? This action cannot be undone."
                />
            </div>
        </div>
    )
}
