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
import { MyLearningPage } from './components/pages/academy/MyLearningPage'
import { CreateCoursePage } from './components/pages/academy/CreateCoursePage'
import { CommunityPage } from './components/pages/community/CommunityPage'
import { CreatePostPage } from './components/pages/community/CreatePostPage'
import { PostDetailsPage } from './components/pages/community/PostDetailsPage'
import { SavedPostsPage } from './components/pages/community/SavedPostsPage'
import { SchemesPage } from './components/pages/schemes/SchemesPage'
import { SchemeDetailsPage } from './components/pages/schemes/SchemeDetailsPage'
import { SavedSchemesPage } from './components/pages/schemes/SavedSchemesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/create" element={<CreateJobPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/academy" element={<AcademyPage />} />
        <Route path="/academy/create" element={<CreateCoursePage />} />
        <Route path="/academy/my-learning" element={<MyLearningPage />} />
        <Route path="/academy/course/:courseId" element={<CourseDetailsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/create" element={<CreatePostPage />} />
        <Route path="/community/saved" element={<SavedPostsPage />} />
        <Route path="/community/post/:postId" element={<PostDetailsPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
        <Route path="/saved-schemes" element={<SavedSchemesPage />} />
        <Route path="/home/schemes" element={<SchemesPage />} />
        <Route path="/home/community" element={<CommunityPage />} />
        <Route path="/home/:section" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
