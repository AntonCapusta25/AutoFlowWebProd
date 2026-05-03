import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookiesBanner from './components/CookiesBanner'
import PriceCalculator from './components/PriceCalculator'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'
import './styles/index.css'

// Lazy-loaded (blog content is large — only fetch when needed)
const Blog          = lazy(() => import('./pages/Blog'))
const BlogPost     = lazy(() => import('./pages/BlogPost'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))

// Admin (Lazy)
const AdminLogin     = lazy(() => import('./pages/Admin/Login'))
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminLeads     = lazy(() => import('./pages/Admin/Leads'))
const AdminOutreach  = lazy(() => import('./pages/Admin/Outreach'))
const AdminSegments  = lazy(() => import('./pages/Admin/Segments'))
const AdminCampaigns = lazy(() => import('./pages/Admin/Campaigns'))
const AuthGuard      = lazy(() => import('./components/Admin/AuthGuard'))

const Loading = () => <div style={{ minHeight: '100vh', background: '#0F1115' }} />

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Navbar />}
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ── English routes ── */}
          <Route path="/"                  element={<Home lang="en" />} />
          <Route path="/blog"              element={<Blog lang="en" />} />
          <Route path="/blog/:slug"        element={<BlogPost lang="en" />} />
          <Route path="/portfolio"         element={<Portfolio lang="en" />} />
          <Route path="/projects/:slug"    element={<ProjectDetail lang="en" />} />
          <Route path="/contact"           element={<Contact lang="en" />} />
          <Route path="/privacy-policy"    element={<PrivacyPolicy />} />
          <Route path="/cookie-policy"     element={<CookiePolicy />} />

          {/* ── Dutch routes (/nl/) ── */}
          <Route path="/nl"                element={<Home lang="nl" />} />
          <Route path="/nl/blog"           element={<Blog lang="nl" />} />
          <Route path="/nl/blog/:slug"     element={<BlogPost lang="nl" />} />
          <Route path="/nl/portfolio"      element={<Portfolio lang="nl" />} />
          <Route path="/nl/projects/:slug" element={<ProjectDetail lang="nl" />} />
          <Route path="/nl/contact"        element={<Contact lang="nl" />} />

          {/* ── Admin routes ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
          <Route path="/admin/leads" element={<AuthGuard><AdminLeads /></AuthGuard>} />
          <Route path="/admin/outreach" element={<AuthGuard><AdminOutreach /></AuthGuard>} />
          <Route path="/admin/segments" element={<AuthGuard><AdminSegments /></AuthGuard>} />
          <Route path="/admin/campaigns" element={<AuthGuard><AdminCampaigns /></AuthGuard>} />

          <Route path="*"                  element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
      {!isAdmin && <CookiesBanner />}
      {/* {!isAdmin && <PriceCalculator />} */}
    </>
  )
}
