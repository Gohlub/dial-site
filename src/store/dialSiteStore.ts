import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios, { AxiosResponse } from 'axios'
import { UserInfo, isUserInfoValid } from '../types/UserInfo'
import { UserNode } from '../types/UserNode'
import { middleware, MiddlewareResult } from '../utilities/middleware'
import { ServerAlert } from '../types/ServerAlert'
import { ClientAlert } from '../types/ClientAlert'
import { ProductSubscription } from '../types/Subscriptions'


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
    alerts: Array<ServerAlert | ClientAlert>
    setAlerts: (alerts: Array<ServerAlert | ClientAlert>) => void
    addClientAlert: (message: any, id?: number, _class?: string) => void
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
            alerts: [],
            setAlerts: (alerts: Array<ServerAlert | ClientAlert>) =>
                set({ alerts }),
            setExpectedAvailabilityDate: (
                expectedAvailabilityDate: number | null,
            ) => set({ expectedAvailabilityDate }),
            setServerIsUnderMaintenance: (serverIsUnderMaintenance: boolean) =>
                set({ serverIsUnderMaintenance }),
            redirectToX: async () => {
                const { setAlerts } = get()
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
                setAlerts([])
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
                const { setAlerts } = get()
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

                console.log({ registerResult: result })

                if (result.error) {
                    setAlerts([
                        {
                            id: Math.round(Math.random() * 1000000000),
                            class: 'alert',
                            start_time: Math.floor(Date.now() / 1000),
                            content: result.message,
                            dismissed: false,
                        },
                    ])
                    return false
                }
                return true
            },
            verifyEmail: async (email: string, hash: string, code: string) => {
                const { setAlerts, setEmailToken: setToken } = get()
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
                console.log({ verifyEmailResult: result })
                if (result.error) {
                    setAlerts([
                        {
                            id: Math.round(Math.random() * 1000000000),
                            class: 'alert',
                            start_time: Math.floor(Date.now() / 1000),
                            content: result.message,
                            dismissed: false,
                        },
                    ])
                    return false
                }
                if (result.data?.token) {
                    setToken(result.data.token)
                }
                return true
            },
            loginWithEmail: async (email: string, password: string) => {
                const { setAlerts } = get()
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
                    setAlerts([
                        {
                            id: Math.round(Math.random() * 1000000000),
                            class: 'alert',
                            start_time: Math.floor(Date.now() / 1000),
                            content: result.message,
                            dismissed: false,
                        },
                    ])
                    return false
                }
                console.log({ loginResult: result })
                return true
            },
            loadingStage: '',
            setLoadingStage: (loadingStage?: string) => set({ loadingStage }),
            pendingSubscription: null,
            setPendingSubscription: (pendingSubscription: { subscriptionId: number, message: string } | null) => set({ pendingSubscription }),
            getUserInfo: async () => {
                const {
                    getTokenViaLoginMode,
                    setServerIsUnderMaintenance,
                    setExpectedAvailabilityDate,
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
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
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
            setUserInfo: (userInfo: UserInfo | null) => set({ userInfo }),
            getServerAlerts: async () => {
                const { alerts, setAlerts } = get()
                const result = await middleware(
                    axios.get(`/api/alerts`, {
                        headers: {
                            'Content-Type': 'application/json',
                            client_id: 2,
                        },
                    }),
                )
                setAlerts(
                    [
                        ...alerts,
                        ...(result.data?.alerts.map((a: ServerAlert) => ({
                            ...a,
                            dismissed:
                                alerts.find((b) => b.id === a.id)?.dismissed ||
                                false,
                        })) || []),
                    ].filter((al, i, a) => a.indexOf(al) === i),
                )
            },
            getUserNodes: async (existingTimeout?: NodeJS.Timeout) => {
                const {
                    getTokenViaLoginMode,
                    setServerIsUnderMaintenance,
                    setExpectedAvailabilityDate,
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
                console.log({ result })
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
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
                    Array.isArray(result.data.nodes)
                ) {
                    set({ userNodes: result.data.nodes })
                } else if (!existingTimeout) {
                    const timeout = setTimeout(() => {
                        get().getUserNodes(timeout)
                    }, 10000)
                }
            },
            checkProducts: async (locale: string) => {
                const { addClientAlert, setServerIsUnderMaintenance, setExpectedAvailabilityDate } = get()
                const result = await middleware(
                    axios.get(`/api/products/${locale}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            client_id: 2,
                        },
                    }),
                );
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return []
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
                if (result.error) {
                    addClientAlert(
                        'Error fetching products. Please sign in again if issue persists.',
                    )
                    return []
                }
                console.log({ products: result })
                return result.data as ProductSubscription[]
            },
            purchaseProduct: async (fee: { productId: number, periodicity: string, price: number }) => {
                const { getTokenViaLoginMode, setServerIsUnderMaintenance, setExpectedAvailabilityDate, addClientAlert, } = get()
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
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return null
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
                if (result.error || !result.data?.message || !result.data?.subscriptionId) {
                    addClientAlert(
                        'Error fetching products. Please sign in again if issue persists.',
                    )
                    return null
                }
                console.log({ purchaseProductResult: result })
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
                const { setEmailToken: setToken, setAlerts, setUserInfo, setUserNodes } = get()
                setToken('')
                setUserInfo(null)
                setUserNodes([])
                setAlerts([])
            },
            addNodeModalOpen: false,
            setAddNodeModalOpen: (addNodeModalOpen: boolean) => {
                set({ addNodeModalOpen })
            },
            resetPasswordModalOpen: false,
            setResetPasswordModalOpen: (resetPasswordModalOpen: boolean) => {
                set({ resetPasswordModalOpen })
            },
            addClientAlert: (message: any, id?: number, _class?: string) => {
                const { alerts, setAlerts } = get()
                setAlerts([
                    ...alerts,
                    {
                        id: id || Math.round(Math.random() * 1000000000),
                        class: _class || 'alert',
                        start_time: Math.floor(Date.now() / 1000),
                        content: message,
                        dismissed: false,
                    },
                ])
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
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return false
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
                if (result.error) {
                    if (result.loginAgain) {
                        alert('Your session has timed out. Please log in.')
                        onSignOut()
                    }
                    addClientAlert(
                        'There was an issue checking the availability of your node. Please ensure node name is valid and that you are properly signed in.',
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
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return {
                        success: false,
                        error: 'Server Maintenance in Progress',
                    }
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
                if (result.error) {
                    if (result.loginAgain) {
                        alert('Your session has timed out. Please log in.')
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
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return {
                        success: false,
                        error: 'Server Maintenance in Progress',
                    }
                }
                setServerIsUnderMaintenance(false)
                setExpectedAvailabilityDate(null)
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
                if (result.maintenance) {
                    setServerIsUnderMaintenance(true)
                    setExpectedAvailabilityDate(result.expectedAvailability)
                    return {
                        success: false,
                        error: 'Server Maintenance in Progress',
                    }
                }
                if (result.error) {
                    return {
                        success: false,
                        error: 'There was an issue submitting your contact request. Please try again.',
                    }
                }
                return { success: true, error: false }
            },
        }),
        {
            name: 'dial-site', // unique name
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
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
    return { shouldReturn: false };
};

export default useDialSiteStore
