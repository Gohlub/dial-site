import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import { UserInfo, isUserInfoValid } from '../types/UserInfo'
import { UserNode } from '../types/UserNode'
import { middleware } from '../utilities/middleware'
import { ServerAlert } from '../types/ServerAlert'
import { ClientAlert } from '../types/ClientAlert'

export interface ValetStore {
  token: string
  setToken: (token: string) => void
  getUserInfo: () => Promise<void>
  userInfo: UserInfo | null
  setUserInfo: (userInfo: UserInfo | null) => void
  getUserNodes: () => Promise<void>
  userNodes: UserNode[]
  setUserNodes: (nodes: UserNode[]) => void
  viteMode: string
  onSignOut: () => void
  addNodeModalOpen: boolean
  setAddNodeModalOpen: (addNodeModalOpen: boolean) => void
  resetPasswordModalOpen: boolean
  setResetPasswordModalOpen: (resetPasswordModalOpen: boolean) => void
  checkIsNodeAvailable: (node: string) => Promise<boolean>
  bootNode: (kinodeName: string, passwordHash: string) => Promise<{ success: boolean, error: boolean | string }>
  resetNodePassword: (node: UserNode, passwordHash: string) => Promise<{ success: boolean, error: boolean | string }>
  activeNode: UserNode | null
  setActiveNode: (node: UserNode | null) => void
  serverIsUnderMaintenance: boolean
  setServerIsUnderMaintenance: (serverIsUnderMaintenance: boolean) => void
  expectedAvailabilityDate: number | null
  setExpectedAvailabilityDate: (expectedAvailabilityDate: number | null) => void
  alerts: Array<ServerAlert | ClientAlert>
  setAlerts: (alerts: Array<ServerAlert | ClientAlert>) => void
  addClientAlert: (message: any, id?: number, _class?: string) => void
  getServerAlerts: () => Promise<void>
  onRegenerateSshPassword: (node: UserNode) => Promise<void>
  get: () => ValetStore
  set: (state: ValetStore) => void
  redirectToX: () => Promise<void>
  submitContactRequest: (name: string, email: string, msg: string) => Promise<{ success: boolean, error: boolean | string }>
}

const useValetStore = create<ValetStore>()(
  persist(
    (set, get) => ({
      set,
      get,
      viteMode: import.meta.env.MODE,
      token: '',
      activeNode: null,
      serverIsUnderMaintenance: false,
      expectedAvailabilityDate: null,
      alerts: [],
      setAlerts: (alerts: Array<ServerAlert | ClientAlert>) => set({ alerts }),
      setExpectedAvailabilityDate: (expectedAvailabilityDate: number | null) => set({ expectedAvailabilityDate }),
      setServerIsUnderMaintenance: (serverIsUnderMaintenance: boolean) => set({ serverIsUnderMaintenance }),
      setActiveNode: (node: UserNode | null) => set({ activeNode: node }),
      setToken: (token: string) => set({ token }),
      redirectToX: async () => {
        const { setAlerts } = get()
        const { data } = await axios.post(`/api/get-x-redirect-url`, {
          returnUrl: window.location.href
        }, {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        window.location.href = data;
        setAlerts([])
      },
      getUserInfo: async () => {
        const { token, setServerIsUnderMaintenance, setExpectedAvailabilityDate, addClientAlert, onSignOut, } = get()
        if (!token) return
        const result = await middleware(axios.get(`/api/get-user-info-x`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }))
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
          addClientAlert('Error fetching user info. Please sign in again.')
          return
        }
        else if (result.data && isUserInfoValid(result.data)) {
          set({ userInfo: result.data })
        }
      },
      userInfo: null,
      setUserInfo: (userInfo: UserInfo | null) => set({ userInfo }),
      getServerAlerts: async () => {
        const { alerts, setAlerts, } = get()
        const result = await middleware(axios.get(`/api/alerts`, {
          headers: {
            'Content-Type': 'application/json',
            'client_id': 2,
          }
        }))
        setAlerts([...alerts, ...(result.data?.alerts.map((a: ServerAlert) => ({ ...a, dismissed: alerts.find(b => b.id === a.id)?.dismissed || false })) || [])].filter((al, i, a) => a.indexOf(al) === i));
      },
      getUserNodes: async () => {
        const { token, activeNode, setActiveNode, setServerIsUnderMaintenance, setExpectedAvailabilityDate, addClientAlert, onSignOut } = get()
        if (!token) return
        const result = await middleware(axios.get(`/api/get-user-kinodes`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }))
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

          addClientAlert('Error fetching user nodes. Please sign in again if issue persists.');
          return
        }
        if (activeNode && !result.data.find((n: UserNode) => n.id === activeNode.id)) {
          setActiveNode(null)
        }
        if (result.data && Array.isArray(result.data) && result.data.find((n: UserNode) => n.ship_type === 'kinode')) {
          set({ userNodes: result.data })
        } else {
          setTimeout(() => {
            get().getUserNodes()
          }, 10000)
        }
      },
      userNodes: [],
      setUserNodes: (userNodes: UserNode[]) => set({ userNodes }),
      onSignOut: () => {
        const { setToken, setAlerts, setUserInfo, setUserNodes } = get()
        setToken('')
        setUserInfo(null)
        setUserNodes([])
        setAlerts([])
      },
      onRegenerateSshPassword: async (node: UserNode) => {
        const { token, setServerIsUnderMaintenance, setExpectedAvailabilityDate, setActiveNode, addClientAlert, onSignOut } = get()
        const result = await middleware(axios.put(`/api/regenerate-ssh-password/${node.id}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }));
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

          if (!result?.data?.ssh_password) {
            addClientAlert('Error regenerating SSH password. Please sign in again if issue persists.');
          }
          return
        }
        setActiveNode({ ...node, ssh_password: result.data.ssh_password })
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
        const { alerts, setAlerts } = get();
        setAlerts([...alerts, { id: id || Math.round(Math.random() * 1000000000), class: _class || 'alert', start_time: Math.floor(Date.now() / 1000), content: message, dismissed: false }]);
      },
      checkIsNodeAvailable: async (node: string) => {
        const { token, setServerIsUnderMaintenance, setExpectedAvailabilityDate, addClientAlert, onSignOut } = get()
        if (!token) return false
        if (node.endsWith('.os')) {
          node = node.replace('.os', '')
        }
        const result = await middleware(axios.get(`/api/check-dot-os-availability/${node}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }))
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
          addClientAlert('There was an issue checking the availability of your node. Please ensure node name is valid and that you are properly signed in.')
          return false
        }
        if (result.data?.message === "Name available") {
          return true
        }
        return false
      },
      bootNode: async (kinodeName: string, passwordHash: string) => {
        const { token, setServerIsUnderMaintenance, setExpectedAvailabilityDate, onSignOut } = get()
        if (!token) return { success: false, error: 'Token is required. Please log in.' }
        if (!passwordHash.startsWith('0x')) {
          passwordHash = '0x' + passwordHash
        }
        if (kinodeName.includes('.')) {
          kinodeName = kinodeName.split('.')[0]
        }
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        console.log({ headers })
        const result = await middleware(axios.post(`/api/free-kinode-eligibility-boot`, {
          productId: 2,
          kinodeName,
          kinodePassword: passwordHash
        },
          { headers }
        ))
        if (result.maintenance) {
          setServerIsUnderMaintenance(true)
          setExpectedAvailabilityDate(result.expectedAvailability)
          return { success: false, error: 'Server Maintenance in Progress' }
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
        return { success: (Boolean(result.data.eligible) || Boolean(result.data.message)), error: result.data.reason || false }
      },
      resetNodePassword: async (node: UserNode, passwordHash: string) => {
        const { token, setServerIsUnderMaintenance, setExpectedAvailabilityDate, } = get()
        if (!token) return { success: false, error: 'Token is required. Please log in.' }
        if (node.kinode_name.includes('.')) {
          node.kinode_name = node.kinode_name.split('.')[0]
        }
        if (!passwordHash.startsWith('0x')) {
          passwordHash = '0x' + passwordHash
        }
        const result = await middleware(axios.put(`/api/reset-kinode-password/${node.id}`, {
          kinodePassword: passwordHash
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }))
        if (result.maintenance) {
          setServerIsUnderMaintenance(true)
          setExpectedAvailabilityDate(result.expectedAvailability)
          return { success: false, error: 'Server Maintenance in Progress' }
        }
        setServerIsUnderMaintenance(false)
        setExpectedAvailabilityDate(null)
        if (result.error) {
          return { success: false, error: result.message }
        }
        return { success: true, error: false }
      },
      submitContactRequest: async (name: string, email: string, msg: string) => {
        const { token, setServerIsUnderMaintenance, setExpectedAvailabilityDate, } = get()
        const result = await middleware(axios.post(`/api/${token ? 'logged-' : ''}send-contact-email`, {
          name,
          email,
          msg
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined,
            'client_id': token ? undefined : 2,
          }
        }))
        if (result.maintenance) {
          setServerIsUnderMaintenance(true)
          setExpectedAvailabilityDate(result.expectedAvailability)
          return { success: false, error: 'Server Maintenance in Progress' }
        }
        if (result.error) {
          return { success: false, error: 'There was an issue submitting your contact request. Please try again.' }
        }
        return { success: true, error: false }
      }
    }),
    {
      name: 'valet', // unique name
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
)

export default useValetStore