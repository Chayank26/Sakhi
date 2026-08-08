import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './components/pages/landing/LandingPage'
import { LoginPage } from './components/pages/login/LoginPage'
import { HomePage } from './components/pages/home/HomePage'
import { JobsPage } from './components/pages/jobs/JobsPage'
import { JobDetailsPage } from './components/pages/jobs/JobDetailsPage'
import { CreateJobPage } from './components/pages/jobs/CreateJobPage'
import { AcademyPage } from './components/pages/academy/AcademyPage'
import { CourseDetailsPage } from './components/pages/academy/CourseDetailsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/home/:section" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/create" element={<CreateJobPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/academy" element={<AcademyPage />} />
        <Route path="/academy/course/:courseId" element={<CourseDetailsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
