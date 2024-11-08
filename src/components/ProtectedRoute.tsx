import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = localStorage.getItem('operatorToken')

    if (!token) {
        return <Navigate to="/operator/login" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute 