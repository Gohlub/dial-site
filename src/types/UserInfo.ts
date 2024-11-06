export interface UserInfo {
    id: number
    contact_email: string | null
    password: boolean
    max_kinodes: number
    remaining_kinodes: number
    remaining_trial: boolean
    emailLogins: []
    siweLogins: []
    xLogins: [
        {
            id: number
            functional_identifier: string
            display_identifier: string
            last_used: string
        }
    ]
}

export const isUserInfoValid = (
    userInfo: UserInfo | null,
): userInfo is UserInfo => {
    return userInfo !== null
}
