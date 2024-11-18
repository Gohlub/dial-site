import { Navigate } from 'react-router-dom'
import useDialSiteStore from '../store/dialSiteStore'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { operatorToken } = useDialSiteStore(state => ({
        operatorToken: state.operatorToken
    }))

    if (!operatorToken) {
        return <Navigate to="/operator/login" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute 