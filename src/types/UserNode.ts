import { NodeSubscription } from "./Subscriptions"

export interface UserNode {
    created_at: string
    email: string
    id: number
    kinode_name: string
    kinode_password?: string
    last_restarted: string
    link: string
    maintenance_window?: string
    payment_status?: string
    product_description: string
    product_id: number
    product_title: string
    product_type: string
    screen_name: string
    ship_status: string
    ship_type: string
    updated_at: string
    user_id: number
    ssh_address?: string
    ssh_username?: string
    ssh_password?: string
    subscription_id: number
    subscription_status: string
    periodicity: string
    start?: number
    end?: number
    local_http_port?: string
    subscriptions?: NodeSubscription[]
}

export interface UserNodesInfo {
    nodes: UserNode[]
    unassigned_subscriptions: any[]
}


export function isUserNodesInfo(data: any): data is UserNodesInfo {
    return data && Array.isArray(data.nodes)
}

export function getFirstNode(nodes: Record<number, UserNode>): UserNode | null {
    const nodeId = Object.keys(nodes || {})[0]
    if (!nodeId) return null
    const node = nodes[nodeId as unknown as number] as UserNode
    return node || null
}