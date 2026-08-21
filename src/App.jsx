import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookiesBanner from './components/CookiesBanner'
import PromoBanner from './components/PromoBanner'
import MultiStepBooking from './components/MultiStepBooking'
import './styles/index.css'

// ── Public pages (lazy) ───────────────────────────────────────────────────
const Home          = lazy(() => import('./pages/Home'))
const Portfolio     = lazy(() => import('./pages/Portfolio'))
const Contact       = lazy(() => import('./pages/Contact'))
const NotFound      = lazy(() => import('./pages/NotFound'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const CookiePolicy  = lazy(() => import('./pages/CookiePolicy'))
const Blog          = lazy(() => import('./pages/Blog'))
const BlogPost      = lazy(() => import('./pages/BlogPost'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))

// ── Landing / Targeted Solutions pages (lazy) ──────────────────────────────
const B2BAutomation = lazy(() => import('./pages/Landing/B2BAutomation'))
const HVACAutomation = lazy(() => import('./pages/Landing/HVACAutomation'))
const HorecaAutomation = lazy(() => import('./pages/Landing/HorecaAutomation'))
const MarketingAutomation = lazy(() => import('./pages/Landing/MarketingAutomation'))

// ── Admin pages (lazy — never fetched by public visitors) ─────────────────
const AdminLogin        = lazy(() => import('./pages/Admin/Login'))
const AdminDashboard    = lazy(() => import('./pages/Admin/Dashboard'))
const AdminLeads        = lazy(() => import('./pages/Admin/Leads'))
const AdminOutreach     = lazy(() => import('./pages/Admin/Outreach'))
const AdminSegments     = lazy(() => import('./pages/Admin/Segments'))
const AdminSegmentView  = lazy(() => import('./pages/Admin/SegmentView'))
const AdminCampaigns    = lazy(() => import('./pages/Admin/Campaigns'))
const AdminEmailSettings= lazy(() => import('./pages/Admin/EmailSettings'))
const AdminTeam         = lazy(() => import('./pages/Admin/Team'))
const AdminDeals        = lazy(() => import('./pages/Admin/Deals'))
const AdminChat         = lazy(() => import('./pages/Admin/Chat'))
const AdminCalendar     = lazy(() => import('./pages/Admin/Calendar'))
const AdminMarketing    = lazy(() => import('./pages/Admin/Marketing/index'))
const AdminKnowledge    = lazy(() => import('./pages/Admin/Knowledge'))
const AdminBlogCMS      = lazy(() => import('./pages/Admin/BlogCMS'))
const AuthGuard = lazy(() => import('./components/Admin/AuthGuard'))
const AdminGuard = lazy(() => import('./components/Admin/AuthGuard').then(m => ({ default: m.AdminGuard })))
import ChatbotWidget from './components/ChatbotWidget'

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
  const isLandingPage = location.pathname.includes('/solutions/')
  const hideGlobalLayout = isAdmin || isLandingPage

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const isNl = location.pathname.startsWith('/nl')

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail?.query) setInitialQuery(e.detail.query)
      setIsBookingOpen(true)
    }
    window.addEventListener('open-booking', handleOpen)
    return () => window.removeEventListener('open-booking', handleOpen)
  }, [])


  return (
    <>
      {!hideGlobalLayout && <Navbar />}
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

          {/* ── Landing / Targeted Solutions routes ── */}
          <Route path="/solutions/b2b-automation" element={<B2BAutomation lang="en" />} />
          <Route path="/nl/solutions/b2b-automation" element={<B2BAutomation lang="nl" />} />
          <Route path="/solutions/hvac-field-services" element={<HVACAutomation lang="en" />} />
          <Route path="/nl/solutions/hvac-field-services" element={<HVACAutomation lang="nl" />} />
          <Route path="/solutions/horeca-hospitality" element={<HorecaAutomation lang="en" />} />
          <Route path="/nl/solutions/horeca-hospitality" element={<HorecaAutomation lang="nl" />} />
          <Route path="/solutions/marketing-agency" element={<MarketingAutomation lang="en" />} />
          <Route path="/nl/solutions/marketing-agency" element={<MarketingAutomation lang="nl" />} />

          {/* ── Dutch routes (/nl/) ── */}
          <Route path="/nl"                element={<Home lang="nl" />} />
          <Route path="/nl/blog"           element={<Blog lang="nl" />} />
          <Route path="/nl/blog/:slug"     element={<BlogPost lang="nl" />} />
          <Route path="/nl/portfolio"      element={<Portfolio lang="nl" />} />
          <Route path="/nl/projects/:slug" element={<ProjectDetail lang="nl" />} />
          <Route path="/nl/contact"        element={<Contact lang="nl" />} />

          {/* ── Admin routes ── */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
          <Route path="/admin/leads" element={<AdminGuard><AdminLeads /></AdminGuard>} />
          <Route path="/admin/outreach" element={<AuthGuard><AdminOutreach /></AuthGuard>} />
          <Route path="/admin/chat" element={<AuthGuard><AdminChat /></AuthGuard>} />
          <Route path="/admin/calendar" element={<AuthGuard><AdminCalendar /></AuthGuard>} />
          <Route path="/admin/segments" element={<AdminGuard><AdminSegments /></AdminGuard>} />
          <Route path="/admin/segments/:id" element={<AdminGuard><AdminSegmentView /></AdminGuard>} />
          <Route path="/admin/campaigns" element={<AdminGuard><AdminCampaigns /></AdminGuard>} />
          <Route path="/admin/team" element={<AdminGuard><AdminTeam /></AdminGuard>} />
          <Route path="/admin/deals" element={<AuthGuard><AdminDeals /></AuthGuard>} />
          <Route path="/admin/email-settings" element={<AdminGuard><AdminEmailSettings /></AdminGuard>} />
          <Route path="/admin/marketing" element={<AdminGuard><AdminMarketing /></AdminGuard>} />
          <Route path="/admin/knowledge" element={<AdminGuard><AdminKnowledge /></AdminGuard>} />
          <Route path="/admin/blog" element={<AdminGuard><AdminBlogCMS /></AdminGuard>} />

          <Route path="*"                  element={<NotFound />} />
        </Routes>
      </Suspense>
      {!hideGlobalLayout && <Footer />}
      {!isAdmin && <CookiesBanner />}
      {!hideGlobalLayout && <PromoBanner onCTA={() => window.dispatchEvent(new CustomEvent('open-booking'))} />}
      {!isAdmin && (
        <MultiStepBooking 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
          initialQuery={initialQuery}
          lang={isNl ? 'nl' : 'en'}
        />
      )}
      {!isAdmin && <ChatbotWidget />}

      {/* {!isAdmin && <PriceCalculator />} */}

    </>
  )
}
