/*    {
        "id": 1,
        "priority": 10,
        "title": "Dial Subscription",
        "description": "Kinode with Dial installed, free trial",
        "long_description": "kinode subscription",
        "lang_code": "en",
        "client_id": 2,
        "is_migration": false,
        "subscription_price": 0,
        "price_id": "9999999",
        "is_planet": true,
        "droplet_class_id": 1,
        "product_status": "active",
        "threshold": null,
        "price_options": [
            {
                "amount": 8.25,
                "status": "active",
                "periodicity": "monthly"
            },
            {
                "amount": 0,
                "status": "active",
                "periodicity": "weekly"
            }
        ],
        "comet_count": "0",
        "product_type": "kinode-subscription"
    },*/
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
