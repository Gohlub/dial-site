export interface MiddlewareResult {
    status: number
    data: any
    message: string
    error: boolean
    maintenance: boolean
    expectedAvailability: number | null
    loginAgain?: boolean
}

export const middleware = async (axiosAction: Promise<any>): Promise<MiddlewareResult> => {
    try {
        const result = await axiosAction
        console.log({ axios: result })
        return {
            status: result.status,
            data: result.data || result,
            message: result.statusText,
            error: result.status >= 400,
            maintenance: false,
            expectedAvailability: null,
        }
    } catch (e: any) {
        if (e.response?.status === 409) {
            return {
                status: e.response?.status,
                data: e.response?.data,
                error: true,
                message:
                    e.response?.data?.message ||
                    'Server Maintenance in Progress',
                maintenance: true,
                expectedAvailability: e.response?.data?.expectedAvailability,
            }
        } else if (e.response?.status === 503) {
            return {
                status: e.response?.status,
                data: e.response?.data,
                error: true,
                message: 'Please login again.',
                maintenance: false,
                expectedAvailability: null,
                loginAgain: true,
            }
        } else {
            return {
                status: e.response?.status,
                data: e.response?.data,
                error: true,
                message:
                    e.response?.data?.message || e.message || 'Server Error',
                maintenance: false,
                expectedAvailability: null,
            }
        }
    }
}
