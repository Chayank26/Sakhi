import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './components/pages/landing/LandingPage'
import { LoginPage } from './components/pages/login/LoginPage'
import { HomePage } from './components/pages/home/HomePage'
import { JobsPage } from './components/pages/jobs/JobsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/home/:section" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
