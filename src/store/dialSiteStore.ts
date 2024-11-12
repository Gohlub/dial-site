import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import { UserInfo, isUserInfoValid } from '../types/UserInfo'
import { UserNode } from '../types/UserNode'
import { middleware, MiddlewareResult } from '../utilities/middleware'
import { ProductSubscription } from '../types/Subscriptions'
import { toast, ToastOptions } from 'react-toastify'
import { ServerAlert } from '../types/ServerAlert'
import { ClientAlert } from '../types/ClientAlert'


export enum LoginMode {
    None,
    Email,
    X,
    SIWE,
};

export interface DialSiteStore {
    emailToken: string
    setEmailToken: (token: string) => void
    xToken: string
    setXToken: (token: string) => void
    siweToken: string
    setSiweToken: (token: string) => void
    loginMode: LoginMode
    setLoginMode: (loginMode: LoginMode) => void
    getTokenViaLoginMode: () => string | null
    pendingSubscription: {
        subscriptionId: number,
        message: string
    } | null;
    setPendingSubscription: (pendingSubscription: { subscriptionId: number, message: string } | null) => void
    getUserInfo: () => Promise<void>
    userInfo: UserInfo | null
    setUserInfo: (userInfo: UserInfo | null) => void
    getUserNodes: (existingTimeout?: NodeJS.Timeout) => Promise<void>
    userNodes: UserNode[]
    setUserNodes: (nodes: UserNode[]) => void
    viteMode: string
    onSignOut: () => void
    addNodeModalOpen: boolean
    setAddNodeModalOpen: (addNodeModalOpen: boolean) => void
    checkProducts: (locale: string) => Promise<ProductSubscription[]>
    purchaseProduct: (fee: { productId: number, periodicity: string, price: number }) => Promise<{ message: string, subscriptionId: number } | null>
    assignSubscription: (subscriptionId: number, kinodeName: string, kinodePassword: string) => Promise<boolean>
    resetPasswordModalOpen: boolean
    setResetPasswordModalOpen: (resetPasswordModalOpen: boolean) => void
    checkIsNodeAvailable: (node: string) => Promise<boolean>
    bootNode: (
        kinodeName: string,
        passwordHash: string,
    ) => Promise<{ success: boolean; error: boolean | string }>
    resetNodePassword: (
        node: UserNode,
        passwordHash: string,
    ) => Promise<{ success: boolean; error: boolean | string }>
    serverIsUnderMaintenance: boolean
    setServerIsUnderMaintenance: (serverIsUnderMaintenance: boolean) => void
    expectedAvailabilityDate: number | null
    setExpectedAvailabilityDate: (
        expectedAvailabilityDate: number | null,
    ) => void
    addClientAlert: (
        message: string | ServerAlert | ClientAlert,
        type?: 'success' | 'error' | 'info' | 'warning' | 'danger'
    ) => void
    getServerAlerts: () => Promise<void>
    get: () => DialSiteStore
    set: (state: DialSiteStore) => void
    redirectToX: () => Promise<void>
    submitContactRequest: (
        name: string,
        email: string,
        msg: string,
    ) => Promise<{ success: boolean; error: boolean | string }>
    loadingStage?: string
    setLoadingStage: (loadingStage?: string) => void
    addContactEmail: (email: string) => Promise<boolean>
    loginWithEmail: (email: string, hash: string) => Promise<boolean>
    registerEmail: (email: string, hash: string) => Promise<boolean>
    verifyEmail: (email: string, hash: string, code: string) => Promise<boolean>
    siweNonce: string
    setSiweNonce: (nonce: string) => void
    getSiweNonce: () => Promise<string>
    registerSiwe: (address: string, signature: string) => Promise<{ jwt: string } | null>
    addWhitelistedUser: (user: {
        modality: 'email' | 'phone',
        identifier: string,
        remainingKinodes: number,
        remainingTrial: boolean
    }) => Promise<boolean>
    editWhitelistedIdentifier: (userId: string, identifier: string) => Promise<boolean>
    editRemainingKinodes: (userId: string, remainingKinodes: number) => Promise<boolean>
    editRemainingTrial: (userId: string, remainingTrial: boolean) => Promise<boolean>
    deleteWhitelistedUser: (userId: string) => Promise<boolean>
    operatorToken: string
    setOperatorToken: (token: string) => void
    getOperatorToken: () => string | null
    operatorLogout: () => void
    searchActiveUser: (identifier: string) => Promise<UserInfo[]>
    searchWhitelistedUser: (identifier: string) => Promise<UserInfo[]>
    searchUserById: (userId: string) => Promise<UserInfo | null>
    userPasswordHash: string | null
    setUserPasswordHash: (hash: string | null) => void
}

const convertAlertClassToToastType = (alertClass: string) => {
    switch (alertClass) {
        case 'danger':
            return 'error'
        case 'warning':
            return 'warning'
        case 'info':
            return 'info'
        default:
            return 'info'
    }
}

const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const diff = endTime - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

const useDialSiteStore = create<DialSiteStore>()(
    persist(
        (set, get) => ({
            set,
            get,
            viteMode: import.meta.env.MODE,
            emailToken: '',
            setEmailToken: (token: string) => set({ emailToken: token }),
            xToken: '',
            setXToken: (token: string) => set({ xToken: token }),
            siweToken: '',
            setSiweToken: (token: string) => set({ siweToken: token }),
            loginMode: LoginMode.None,
            setLoginMode: (loginMode: LoginMode) => set({ loginMode }),
            serverIsUnderMaintenance: false,
            expectedAvailabilityDate: null,
            setExpectedAvailabilityDate: (
                expectedAvailabilityDate: number | null,
            ) => set({ expectedAvailabilityDate }),
            setServerIsUnderMaintenance: (serverIsUnderMaintenance: boolean) =>
                set({ serverIsUnderMaintenance }),
            redirectToX: async () => {
                const { data } = await axios.post(
                    `/api/x/signup`,
                    {
                        returnUrl: window.location.href,
                    },
                    {
                        headers: {
                            accept: 'application/json',
                            'Content-Type': 'application/json',
                            client_id: 2,
                        },
                    },
                )
                window.location.href = data
            },
            siweNonce: '',
            setSiweNonce: (nonce: string) => set({ siweNonce: nonce }),
            getSiweNonce: async () => {
                const result = await middleware(axios.get(`/api/siwe/nonce`, {
                    headers: { client_id: 2 },
                }))
                const { shouldReturn, returnValue } = handleMaintenanceState(result, get())
                if (shouldReturn) {
                    return returnValue
                }
                get().setSiweNonce(result.data.nonce)
                return result.data.nonce
            },
            registerSiwe: async (message: string, signature: string) => {
                const result = await middleware(
                    axios.post(`/api/siwe/regin`, { message, signature }, { headers: { client_id: 2 } })
                )
                const { shouldReturn, returnValue } = handleMaintenanceState(result, get())
                if (shouldReturn) {
                    console.log({ registerSiwe: returnValue })
                    return returnValue
                }
                return result.data
            },
            registerEmail: async (email: string, hash: string) => {
                const { addClientAlert } = get()
                const result = await middleware(
                    axios.post(
                        `/api/email/register`,
                        {
                            email,
                            password: hash,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                client_id: 2,
                            },
                        },
                    ),
                )

                if (result.error) {
                    addClientAlert(result.message, 'error')
                    return false
                }
                return true
            },
            verifyEmail: async (email: string, hash: string, code: string) => {
                const { addClientAlert, setEmailToken } = get()
                const result = await middleware(
                    axios.post(
                        `/api/email/verify-account`,
                        {
                            email,
                            password: hash,
                            verificationcode: code,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                client_id: 2,
                            },
                        },
                    ),
                )
                if (result.error) {
                    addClientAlert(result.message, 'error')
                    return false
                }
                if (result.data?.token) {
                    setEmailToken(result.data.token)
                }
                return true
            },
            loginWithEmail: async (email: string, password: string) => {
                const { addClientAlert, setEmailToken } = get()
                const result = await middleware(
                    axios.post(
                        `/api/email/login`,
                        {
                            email,
                            password,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                client_id: 2,
                            },
                        },
                    ),
                )
                if (result.error) {
                    addClientAlert(result.message, 'error')
                    return false
                }
                console.log(result, result.data?.token)
                if (result.data?.token) {
                    setEmailToken(result.data.token)
                }
                return true
            },
            loadingStage: '',
            setLoadingStage: (loadingStage?: string) => set({ loadingStage }),
            pendingSubscription: null,
            setPendingSubscription: (pendingSubscription: { subscriptionId: number, message: string } | null) => set({ pendingSubscription }),
            getUserInfo: async () => {
                const {
                    getTokenViaLoginMode,
                    addClientAlert,
                    onSignOut,
                } = get()
                const token = getTokenViaLoginMode()
                if (!token) return
                const result = await middleware(
                    axios.get(`/api/user/get-user-info`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                )
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return

                if (result.error) {
                    if (result.loginAgain) {
                        alert('Your session has timed out. Please log in.')
                        onSignOut()
                        return
                    }
                    addClientAlert(
                        'Error fetching user info. Please sign in again.',
                    )
                    return
                } else if (result.data && isUserInfoValid(result.data)) {
                    set({ userInfo: result.data })
                }
            },
            userInfo: null,
            setUserInfo: (userInfo: UserInfo | null) => {
                const current = get().userInfo
                if (JSON.stringify(current) !== JSON.stringify(userInfo)) {
                    set({ userInfo })
                }
            },
            getServerAlerts: async () => {
                const result = await middleware(
                    axios.get(`/api/alerts`, {
                        headers: {
                            'Content-Type': 'application/json',
                            client_id: 2,
                        },
                    }),
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return

                if (result.data?.alerts) {
                    result.data.alerts.forEach((alert: ServerAlert) => {
                        get().addClientAlert(alert.content, alert.class)
                    })
                }
            },
            getUserNodes: async (existingTimeout?: NodeJS.Timeout) => {
                const {
                    getTokenViaLoginMode,
                    addClientAlert,
                    onSignOut,
                } = get()
                const token = getTokenViaLoginMode()
                if (!token) return
                const result = await middleware(
                    axios.get(`/api/get-user-kinodes`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                )
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return

                if (result.error) {
                    if (result.loginAgain) {
                        alert('Your session has timed out. Please log in.')
                        onSignOut()
                        return
                    }

                    addClientAlert(
                        'Error fetching user nodes. Please sign in again if issue persists.',
                    )
                    return
                }
                if (
                    result.data &&
                    Array.isArray(result.data.nodes) &&
                    JSON.stringify(get().userNodes) !== JSON.stringify(result.data.nodes)
                ) {
                    set({ userNodes: result.data.nodes })
                } else if (!existingTimeout) {
                    const timeout = setTimeout(() => {
                        get().getUserNodes(timeout)
                    }, 10000)
                }
            },
            checkProducts: async (locale: string) => {
                const { addClientAlert } = get()
                const result = await middleware(
                    axios.get(`/api/products/${locale}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            client_id: 2,
                        },
                    }),
                );
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return []

                if (result.error) {
                    addClientAlert(
                        'Error fetching products. Please sign in again if issue persists.',
                    )
                    return []
                }
                return result.data as ProductSubscription[]
            },
            purchaseProduct: async (fee: { productId: number, periodicity: string, price: number }) => {
                const { getTokenViaLoginMode, addClientAlert } = get()
                const token = getTokenViaLoginMode()
                if (!token) {
                    addClientAlert('You are not signed in. Please do so in order to perform this action.')
                    return null
                }
                const result = await middleware(
                    axios.post(`/api/user/purchase-product`, fee, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    })
                )
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return null

                if (result.error || !result.data?.message || !result.data?.subscriptionId) {
                    addClientAlert(
                        'Error fetching products. Please sign in again if issue persists.',
                    )
                    return null
                }
                return result.data as { message: string, subscriptionId: number }
            },
            assignSubscription: async (subscriptionId: number, kinodeName: string, kinodePassword: string) => {
                const { getTokenViaLoginMode } = get()
                const token = getTokenViaLoginMode()
                if (!token) return false
                if (!kinodePassword.startsWith('0x')) {
                    kinodePassword = '0x' + kinodePassword
                }
                const result = await middleware(
                    axios.post(`/api/user/assign-subscription`, {
                        subscriptionId,
                        kinodeName,
                        kinodePassword,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    })
                )
                console.log({ assignSubscriptionResult: result })
                return !result.error
            },
            addContactEmail: async (email: string) => {
                const { getTokenViaLoginMode } = get()
                const token = getTokenViaLoginMode()
                if (!token) return false
                const result = await middleware(
                    axios.post(`/api/user/set-contact-email`, { email }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
                )
                return !result.error
            },
            userNodes: [],
            setUserNodes: (userNodes: UserNode[]) => set({ userNodes }),
            onSignOut: () => {
                const { setEmailToken: setToken, setUserInfo, setUserNodes } = get()
                setToken('')
                setUserInfo(null)
                setUserNodes([])
            },
            addNodeModalOpen: false,
            setAddNodeModalOpen: (addNodeModalOpen: boolean) => {
                set({ addNodeModalOpen })
            },
            resetPasswordModalOpen: false,
            setResetPasswordModalOpen: (resetPasswordModalOpen: boolean) => {
                set({ resetPasswordModalOpen })
            },
            addClientAlert: (
                message: string | ServerAlert | ClientAlert,
                type?: 'success' | 'error' | 'info' | 'warning' | 'danger'
            ) => {
                let toastMessage: string
                let toastType = type
                let toastOptions: ToastOptions = {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                }

                if (typeof message === 'string') {
                    toastMessage = message
                } else {
                    toastMessage = message.content
                    toastType = convertAlertClassToToastType(toastType || message.class)

                    if ('end_time' in message && message.end_time) {
                        const timeRemaining = formatTimeRemaining(message.end_time)
                        toastMessage = `${toastMessage} (Duration: ${timeRemaining})`

                        const duration = message.end_time - message.start_time
                        if (duration > 5 * 60 * 1000) {
                            toastOptions.autoClose = 15000
                        }
                    }
                }

                try {
                    toast(toastMessage, {
                        ...toastOptions,
                        type: toastType as any,
                    })
                } catch { }
            },
            getTokenViaLoginMode: () => {
                const { loginMode, emailToken, xToken, siweToken } = get()
                if (loginMode === LoginMode.Email) return emailToken
                if (loginMode === LoginMode.X) return xToken
                if (loginMode === LoginMode.SIWE) return siweToken
                return null
            },
            checkIsNodeAvailable: async (node: string) => {
                const {
                    getTokenViaLoginMode,
                    setServerIsUnderMaintenance,
                    setExpectedAvailabilityDate,
                    addClientAlert,
                    onSignOut,
                } = get()
                const token = getTokenViaLoginMode()
                console.log({ checkNodeName: { token } });
                if (!token) return false
                if (node.endsWith('.os')) {
                    node = node.replace('.os', '')
                }
                const result = await middleware(
                    axios.get(`/api/check-dot-os-availability/${node}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return false

                if (result.error) {
                    if (result.loginAgain) {
                        addClientAlert('Your session has timed out. Please log in.', 'error')
                        onSignOut()
                    }
                    addClientAlert(
                        'There was an issue checking the availability of your node. Please ensure node name is valid and that you are properly signed in.',
                        'error'
                    )
                    return false
                }
                if (result.data?.message === 'Name available') {
                    return true
                }
                return false
            },
            bootNode: async (kinodeName: string, passwordHash: string) => {
                const {
                    getTokenViaLoginMode,
                    setServerIsUnderMaintenance,
                    setExpectedAvailabilityDate,
                    onSignOut,
                    addClientAlert,
                } = get()
                const token = getTokenViaLoginMode()
                if (!token)
                    return {
                        success: false,
                        error: 'Token is required. Please log in.',
                    }
                if (!passwordHash.startsWith('0x')) {
                    passwordHash = '0x' + passwordHash
                }
                if (kinodeName.includes('.')) {
                    kinodeName = kinodeName.split('.')[0]
                }
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
                console.log({ headers })
                const result = await middleware(
                    axios.post(
                        `/api/free-kinode-eligibility-boot`,
                        {
                            productId: 2,
                            kinodeName,
                            kinodePassword: passwordHash,
                        },
                        { headers },
                    ),
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return { success: false, error: 'Server Maintenance in Progress' }

                if (result.error) {
                    if (result.loginAgain) {
                        addClientAlert('Your session has timed out. Please log in.', 'error')
                        onSignOut()
                    }

                    return { success: false, error: result.message }
                }
                return {
                    success:
                        Boolean(result.data.eligible) ||
                        Boolean(result.data.message),
                    error: result.data.reason || false,
                }
            },
            resetNodePassword: async (node: UserNode, passwordHash: string) => {
                const {
                    getTokenViaLoginMode,
                    setServerIsUnderMaintenance,
                    setExpectedAvailabilityDate,
                } = get()
                const token = getTokenViaLoginMode()
                if (!token)
                    return {
                        success: false,
                        error: 'Token is required. Please log in.',
                    }
                if (node.kinode_name.includes('.')) {
                    node.kinode_name = node.kinode_name.split('.')[0]
                }
                if (!passwordHash.startsWith('0x')) {
                    passwordHash = '0x' + passwordHash
                }
                const result = await middleware(
                    axios.put(
                        `/api/reset-kinode-password/${node.id}`,
                        {
                            kinodePassword: passwordHash,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    ),
                )
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return { success: false, error: 'Server Maintenance in Progress' }

                if (result.error) {
                    return { success: false, error: result.message }
                }
                return { success: true, error: false }
            },
            submitContactRequest: async (
                name: string,
                email: string,
                msg: string,
            ) => {
                const {
                    getTokenViaLoginMode,
                    setServerIsUnderMaintenance,
                    setExpectedAvailabilityDate,
                } = get()
                const token = getTokenViaLoginMode()
                if (!token)
                    return {
                        success: false,
                        error: 'Token is required. Please log in.',
                    }
                const result = await middleware(
                    axios.post(
                        `/api/${token ? 'logged-' : ''}send-contact-email`,
                        {
                            name,
                            email,
                            msg,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: token
                                    ? `Bearer ${token}`
                                    : undefined,
                                client_id: token ? undefined : 2,
                            },
                        },
                    ),
                )
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return { success: false, error: 'Server Maintenance in Progress' }

                if (result.error) {
                    return {
                        success: false,
                        error: 'There was an issue submitting your contact request. Please try again.',
                    }
                }
                return { success: true, error: false }
            },
            addWhitelistedUser: async (user) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return false

                const result = await middleware(
                    axios.post('/api/operator/add-whitelisted-user', user, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return false;

                if (result.error) {
                    addClientAlert(result.message || 'Failed to add user', 'error')
                    return false
                }
                return true
            },
            editWhitelistedIdentifier: async (userId, identifier) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return false

                const result = await middleware(
                    axios.put(`/api/operator/edit-whitelisted-identifier/${userId}`, {
                        identifier
                    }, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )
                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return false;

                if (result.error) {
                    addClientAlert(result.message || 'Failed to update identifier', 'error')
                    return false
                }
                return true
            },
            editRemainingKinodes: async (userId, remainingKinodes) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return false

                const result = await middleware(
                    axios.put(`/api/operator/edit-remaining-kinodes/${userId}`, {
                        remainingKinodes
                    }, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return false;

                if (result.error) {
                    addClientAlert(result.message || 'Failed to update remaining kinodes', 'error')
                    return false
                }
                return true
            },
            editRemainingTrial: async (userId, remainingTrial) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return false

                const result = await middleware(
                    axios.put(`/api/operator/edit-remaining-trial/${userId}`, {
                        remainingTrial
                    }, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return false;

                if (result.error) {
                    addClientAlert(result.message || 'Failed to update trial status', 'error')
                    return false
                }
                return true
            },
            deleteWhitelistedUser: async (userId) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return false

                const result = await middleware(
                    axios.delete(`/api/operator/delete-whitelisted-user/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                const { shouldReturn } = handleMaintenanceState(result, get())
                if (shouldReturn) return false;

                if (result.error) {
                    addClientAlert(result.message || 'Failed to delete user', 'error')
                    return false
                }
                return true
            },
            operatorToken: '',
            setOperatorToken: (token: string) => set({ operatorToken: token }),
            getOperatorToken: () => get().operatorToken,
            operatorLogout: () => {
                set({ operatorToken: '' })
            },
            searchActiveUser: async (identifier: string) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return []

                const result = await middleware(
                    axios.get(`/api/operator/active-user/${identifier}`, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                if (result.error) {
                    addClientAlert(result.message || 'Failed to fetch active users', 'error')
                    return []
                }
                return result.data || []
            },

            searchWhitelistedUser: async (identifier: string) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return []

                const result = await middleware(
                    axios.get(`/api/operator/whitelisted-user/${identifier}`, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                if (result.error) {
                    addClientAlert(result.message || 'Failed to fetch whitelisted users', 'error')
                    return []
                }
                return result.data || []
            },

            searchUserById: async (userId: string) => {
                const { operatorToken, addClientAlert } = get()
                if (!operatorToken) return null

                const result = await middleware(
                    axios.get(`/api/operator/active-user-by-id/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${operatorToken}`,
                            'Content-Type': 'application/json',
                            client_id: 2
                        }
                    })
                )

                if (result.error) {
                    addClientAlert(result.message || 'Failed to fetch user by ID', 'error')
                    return null
                }
                return result.data
            },
            userPasswordHash: null,
            setUserPasswordHash: (hash: string | null) => set({ userPasswordHash: hash }),
        }),
        {
            name: 'dial-site',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
)

const handleMaintenanceState = (
    result: MiddlewareResult,
    store: DialSiteStore
): { shouldReturn: boolean; returnValue?: any } => {
    const { setServerIsUnderMaintenance, setExpectedAvailabilityDate } = store;

    if (result.data.maintenance) {
        setServerIsUnderMaintenance(true);
        setExpectedAvailabilityDate(result.data.expectedAvailability || null);
        return { shouldReturn: true, returnValue: null };
    }

    setServerIsUnderMaintenance(false);
    setExpectedAvailabilityDate(null);
    return { shouldReturn: false, returnValue: result.data };
};

export default useDialSiteStore
