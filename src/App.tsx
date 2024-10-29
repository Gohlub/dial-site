import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { ProcessToken } from './pages/ProcessToken'
import NotWhitelisted from './pages/NotWhitelisted'
import ContactUs from './pages/ContactUs'
import PageContainer from './components/PageContainer'

function App() {
    return (
        <PageContainer>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/process-token" element={<ProcessToken />} />
                    <Route
                        path="/not-whitelisted"
                        element={<NotWhitelisted />}
                    />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </PageContainer>
    )
}

export default App
