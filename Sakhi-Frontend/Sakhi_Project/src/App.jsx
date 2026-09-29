import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RouteErrorBoundary } from './components/RouteErrorBoundary'
import './App.css'
import { AccountProvider, RequireAccount, AccountNotice } from './components/account/AccountProvider'
const JobApplicationsPage = lazy(() => import('./components/pages/jobs/JobApplicationsPage').then(module => ({ default: module.JobApplicationsPage })))
const JobActivityPage = lazy(() => import('./components/pages/jobs/JobActivityPage').then(module => ({ default: module.JobActivityPage })))
const LearnCoursePage = lazy(() => import('./components/pages/academy/LearnCoursePage').then(module => ({ default: module.LearnCoursePage })))
const LandingPage = lazy(() => import('./components/pages/landing/LandingPage').then(module => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./components/pages/login/LoginPage').then(module => ({ default: module.LoginPage })))
const HomePage = lazy(() => import('./components/pages/home/HomePage').then(module => ({ default: module.HomePage })))
const JobsPage = lazy(() => import('./components/pages/jobs/JobsPage').then(module => ({ default: module.JobsPage })))
const JobDetailsPage = lazy(() => import('./components/pages/jobs/JobDetailsPage').then(module => ({ default: module.JobDetailsPage })))
const CreateJobPage = lazy(() => import('./components/pages/jobs/CreateJobPage').then(module => ({ default: module.CreateJobPage })))
const AcademyPage = lazy(() => import('./components/pages/academy/AcademyPage').then(module => ({ default: module.AcademyPage })))
const CourseDetailsPage = lazy(() => import('./components/pages/academy/CourseDetailsPage').then(module => ({ default: module.CourseDetailsPage })))
const MyLearningPage = lazy(() => import('./components/pages/academy/MyLearningPage').then(module => ({ default: module.MyLearningPage })))
const CreateCoursePage = lazy(() => import('./components/pages/academy/CreateCoursePage').then(module => ({ default: module.CreateCoursePage })))
const CommunityPage = lazy(() => import('./components/pages/community/CommunityPage').then(module => ({ default: module.CommunityPage })))
const CreatePostPage = lazy(() => import('./components/pages/community/CreatePostPage').then(module => ({ default: module.CreatePostPage })))
const PostDetailsPage = lazy(() => import('./components/pages/community/PostDetailsPage').then(module => ({ default: module.PostDetailsPage })))
const SavedPostsPage = lazy(() => import('./components/pages/community/SavedPostsPage').then(module => ({ default: module.SavedPostsPage })))
const SchemesPage = lazy(() => import('./components/pages/schemes/SchemesPage').then(module => ({ default: module.SchemesPage })))
const SchemeDetailsPage = lazy(() => import('./components/pages/schemes/SchemeDetailsPage').then(module => ({ default: module.SchemeDetailsPage })))
const SavedSchemesPage = lazy(() => import('./components/pages/schemes/SavedSchemesPage').then(module => ({ default: module.SavedSchemesPage })))
const AiChatPage = lazy(() => import('./components/pages/ai/AiChatPage').then(module => ({ default: module.AiChatPage })))
const ProfilePage = lazy(() => import('./components/pages/profile/ProfilePage').then(module => ({ default: module.ProfilePage })))
const SettingsPage = lazy(() => import('./components/pages/settings/SettingsPage').then(module => ({ default: module.SettingsPage })))
const SupportPage = lazy(() => import('./components/pages/support/SupportPage').then(module => ({ default: module.SupportPage })))

function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <AccountNotice />
        <RouteErrorBoundary>
          <Suspense fallback={<main className="route-loading" role="status">Getting things ready…</main>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/ai" element={<AiChatPage />} />
            <Route path="/home/ai" element={<AiChatPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/academy/course/:courseId" element={<CourseDetailsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/post/:postId" element={<PostDetailsPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
            <Route path="/home/schemes" element={<SchemesPage />} />
            <Route path="/home/community" element={<CommunityPage />} />
            <Route path="/home/:section" element={<HomePage />} />
            <Route element={<RequireAccount />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/jobs/create" element={<CreateJobPage />} />
              <Route path="/academy/create" element={<CreateCoursePage />} />
              <Route path="/academy/my-learning" element={<MyLearningPage />} />
              <Route path="/community/create" element={<CreatePostPage />} />
              <Route path="/community/saved" element={<SavedPostsPage />} />
              <Route path="/saved-schemes" element={<SavedSchemesPage />} />
              <Route path="/jobs/:jobId/applications" element={<JobApplicationsPage />} />
              <Route path="/jobs/my-activity" element={<JobActivityPage />} />
              <Route path="/academy/course/:courseId/learn" element={<LearnCoursePage />} />
            </Route>
            <Route path="*" element={<main><h1>Page not found</h1><a href="/home">Back to Sakhi</a></main>} />
          </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </AccountProvider>
    </BrowserRouter>
  )
}

export default App
