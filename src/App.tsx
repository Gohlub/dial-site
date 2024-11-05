import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { ProcessXToken } from './pages/ProcessXToken'
import NotWhitelisted from './pages/NotWhitelisted'
import ContactUs from './pages/ContactUs'
import PageContainer from './components/PageContainer'

function App() {
    return (
        <PageContainer>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/x-callback" element={<ProcessXToken />} />
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
