import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UserAuth } from './pages/UserAuth'
import { ProcessXToken } from './pages/ProcessXToken'
import NotWhitelisted from './pages/NotWhitelisted'
import ContactUs from './pages/ContactUs'
import PageContainer from './components/PageContainer'
import OperatorDashboard from './pages/OperatorDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import OperatorLogin from './pages/OperatorLogin'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SignOut } from './pages/SignOut'
import { Home } from './pages/Home'

function App() {
    return (
        <PageContainer>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<UserAuth />} />
                    <Route path="/x-callback" element={<ProcessXToken />} />
                    <Route
                        path="/not-whitelisted"
                        element={<NotWhitelisted />}
                    />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/operator/login" element={<OperatorLogin />} />
                    <Route
                        path="/operator/dashboard"
                        element={
                            <ProtectedRoute>
                                <OperatorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/signout" element={<SignOut />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer />
        </PageContainer>
    )
}

export default App
