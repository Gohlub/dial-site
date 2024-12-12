export interface ProductSubscription {
    id: number
    priority: number
    title: string
    description: string
    long_description: string
    lang_code: string
    client_id: number
    is_migration: boolean
    subscription_price: number
    price_id: string
    is_planet: boolean
    droplet_class_id: number
    product_status: string
    threshold: number | null
    price_options: {
        amount: number
        status: string
        periodicity: string
    }[]
    comet_count: string
    product_type: string
}

export interface NodeSubscription {
    subscription_id: number
    start: string
    end: string
    periodicity: string
    subscription_status: string
    price: number
    subscription_created_at: string
    subscription_updated_at: string
}