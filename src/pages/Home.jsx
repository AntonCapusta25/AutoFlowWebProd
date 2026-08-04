import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/Hero'
import { getT } from '../i18n/translations'
const ICONS = {
  crm: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  lead: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  outreach: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  bot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  ),
  web: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  custom: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  stats: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
}

// Partners & APIs — duplicated for seamless infinite scroll
const CAROUSEL_SLIDES = [
  {
    videoId: 'b467PfZsSXQ',
    videoTitle: 'Custom Photo Improvement Tool',
    videoDesc: 'Automated photo enhancement ensuring every chef\'s dish looks magazine-ready.',
    title: 'Visual Consistency Revolution',
    desc: 'Transformed inconsistent food photos into professional images, making the platform visually competitive.',
    stats: [{ n: '20', l: 'Hours Saved Weekly' }, { n: '5X', l: 'Faster Onboarding' }, { n: '3', l: 'Minutes Processing' }, { n: '€45k', l: 'Annual Savings' }],
    href: '/projects/project-1',
  },
  {
    videoId: 'yTDTiJZXJ3M',
    videoTitle: 'AI-Powered Personalised Email Automation',
    videoDesc: 'AI system generating thousands of personalised, human-sounding emails.',
    title: 'Hyper-Personalised Outreach Engine',
    desc: 'Automated creation of highly personalised sales emails enabling massive outreach volume with human touch.',
    stats: [{ n: '10X', l: 'Outreach Volume' }, { n: '95%', l: 'Personalisation Score' }, { n: '3', l: 'Hours Saved Daily' }, { n: '€60K+', l: 'Annual Savings' }],
    href: '/projects/project-4',
  },
  {
    videoId: 'Rg1Kb2y2BiY',
    videoTitle: 'AI-Powered Chatbot with Telegram Integration',
    videoDesc: 'AI chatbot providing instant 24/7 customer support via Telegram.',
    title: '24/7 Instant Customer Support',
    desc: 'Intelligent chatbot with real-time Telegram integration answering queries instantly.',
    stats: [{ n: '70%', l: 'Inquiries Automated' }, { n: 'Real-time', l: 'Answers' }, { n: '35', l: 'Hours Saved Weekly' }, { n: '€40K+', l: 'Annual Savings' }],
    href: '/projects/project-2',
  },
  {
    videoId: 'KjOoXLNfWlA',
    videoTitle: 'Data Goldmine Automation',
    videoDesc: 'Automated lead generation engine scraping and enriching prospect data.',
    title: 'AI-Powered Precision Lead Scraping',
    desc: 'Automated lead qualification that scores prospects, sends personalised follow-ups, and routes high-value leads to sales.',
    stats: [{ n: '5-7X', l: 'Lead Volume' }, { n: '30', l: 'Hours Saved Weekly' }, { n: '85%', l: 'Lead Quality Score' }, { n: '€55K+', l: 'Annual Savings' }],
    href: '/projects/project-3',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'E-commerce Founder', text: 'AutoFlow Studio automated our entire order processing workflow. What used to take our team 3 hours daily now happens automatically in minutes.', initials: 'SC', color: '#d1bbfb' },
  { name: 'Marcus Rodriguez', role: 'Operations Manager', text: 'The Google Sheets automation they built saves us 15 hours per week. The ROI was immediate and the support has been fantastic.', initials: 'MR', color: '#d1bbfb' },
  { name: 'Lisa Park', role: 'Startup Founder', text: 'Finally, someone who understands both the technical side and business needs. They delivered exactly what we needed, on time.', initials: 'LP', color: '#d1bbfb' },
  { name: 'David Müller', role: 'Head of Operations', text: 'Incredible work on our CRM integration. We went from manual data entry to fully automated pipelines in under a week.', initials: 'DM', color: '#7c3aed' },
  { name: 'Emma Visser', role: 'CEO, Homemade BV', text: 'The outreach automation they built scaled our pipeline 10x without adding headcount. Genuinely impressive execution.', initials: 'EV', color: '#0ea5e9' },
  { name: 'Tom Bakker', role: 'Co-founder', text: 'Clean, fast, and exactly what we asked for. They even suggested improvements we hadn\'t thought of. Will work with them again.', initials: 'TB', color: '#10b981' },
  { name: 'Elena Petrova', role: 'SaaS Founder', text: 'The AI customer support bot they integrated reduced our ticket volume by 65%. It sounds completely natural and handles complex queries.', initials: 'EP', color: '#f59e0b' },
  { name: 'James Wilson', role: 'Marketing Director', text: 'Automating our lead scoring changed everything. Our sales team now only talks to high-intent prospects. Revenue is up 40%.', initials: 'JW', color: '#d1bbfb' },
  { name: 'Sophie Martin', role: 'Creative Director', text: 'They automated our entire content distribution pipeline. One upload now triggers 12 different social media posts perfectly.', initials: 'SM', color: '#8b5cf6' },
  { name: 'Arjun Mehta', role: 'Tech Lead', text: 'Seamless integration with our legacy systems. They navigated our complex API requirements with ease and delivered a robust solution.', initials: 'AM', color: '#3b82f6' },
  { name: 'Isabella Rossi', role: 'Product Manager', text: 'The automated reporting dashboard is a game changer. We have real-time visibility into all our KPIs without any manual data crunching.', initials: 'IR', color: '#10b981' },
  { name: 'Lars Jensen', role: 'Logistics Head', text: 'Our inventory management is now 100% autonomous. Errors have dropped to zero and our efficiency is at an all-time high.', initials: 'LJ', color: '#ef4444' },
  { name: 'Chloe Thompson', role: 'HR Director', text: 'The automated onboarding workflow saved our HR team hundreds of hours. New hires feel supported from day one.', initials: 'CT', color: '#06b6d4' },
  { name: 'Michael Osei', role: 'FinTech Founder', text: 'Security and reliability were our top concerns. AutoFlow delivered a rock-solid automation that handles sensitive data flawlessly.', initials: 'MO', color: '#6366f1' },
  { name: 'Yuki Tanaka', role: 'AI Developer', text: 'Their understanding of LLM orchestration is top-tier. They built a custom RAG system that has transformed our internal knowledge base.', initials: 'YT', color: '#d1bbfb' },
  { name: 'Alex Rivera', role: 'Growth Lead', text: 'Fast, professional, and highly effective. The automated email sequences they built converted better than any manual campaign we ever ran.', initials: 'AR', color: '#14b8a6' },
]

const Stars = () => (
  <div style={{ display: 'flex', gap: '3px', marginTop: '12px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#d1bbfb" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
)

const FlowStyles = () => (
  <style>{`
    @keyframes super-flow {
      0% { transform: translateX(-20px); opacity: 0.1; stroke: #d1bbfb; }
      50% { transform: translateX(0); opacity: 1; stroke: #d1bbfb; stroke-width: 3px; }
      100% { transform: translateX(20px); opacity: 0.1; stroke: #d1bbfb; }
    }
    .process-arrow-animated {
      animation: super-flow 1.5s infinite ease-in-out !important;
      filter: drop-shadow(0 0 8px rgba(209, 187, 251, 0.6)) !important;
      overflow: visible !important;
    }
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 280px) 200px;
      grid-template-areas:
        "tall topmid big big"
        "tall botmid big big"
        "wide wide small1 small2";
      gap: 20px;
    }
    .bento-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 32px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      transition: border-color 0.4s ease, background 0.4s ease;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .bento-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(209, 187, 251, 0.4);
    }
    .card-glow {
      position: absolute;
      width: 150%;
      height: 150%;
      background: radial-gradient(circle at center, rgba(209, 187, 251, 0.08) 0%, transparent 60%);
      top: -25%;
      left: -25%;
      pointer-events: none;
      z-index: 1;
    }
    .card-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
      opacity: 0.3;
      pointer-events: none;
      z-index: 1;
    }
    .bento-icon {
      width: 50px;
      height: 50px;
      background: rgba(209, 187, 251, 0.1);
      border: 1px solid rgba(209, 187, 251, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d1bbfb;
      margin-bottom: 24px;
      z-index: 2;
    }
    .bento-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      z-index: 2;
    }
    .bento-desc {
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      line-height: 1.5;
      color: #94A3B8;
      margin: 0;
      z-index: 2;
    }
    .card-tall { grid-area: tall; }
    .card-topmid { grid-area: topmid; }
    .card-botmid { grid-area: botmid; }
    .card-big {
      grid-area: big;
      justify-content: center;
      text-align: center;
    }
    .card-big .bento-title { font-size: 2.8rem; line-height: 1.1; margin-bottom: 16px; }
    .card-wide {
      grid-area: wide;
      flex-direction: row !important;
      align-items: center;
      gap: 24px;
    }
    .card-wide .bento-icon { margin-bottom: 0; flex-shrink: 0; }
    .card-small1 { grid-area: small1; padding: 24px; }
    .card-small2 { grid-area: small2; padding: 24px; }
    .card-small1 .bento-title, .card-small2 .bento-title { font-size: 1.1rem; margin-bottom: 6px; }
    .card-small1 .bento-desc, .card-small2 .bento-desc { font-size: 0.85rem; }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1bbfb;
      box-shadow: 0 0 10px rgba(209, 187, 251, 0.5);
    }
    .badge-tag {
      font-family: 'Inter', sans-serif;
      background: rgba(209, 187, 251, 0.1);
      border: 1px solid rgba(209, 187, 251, 0.2);
      color: #d1bbfb;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      z-index: 2;
    }
    .services-stack {
      display: flex;
      flex-direction: column;
      gap: 64px;
      margin-top: 64px;
    }
    .service-stack-card {
      position: sticky;
      top: 110px;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 36px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.42);
      background: #101010;
      isolation: isolate;
    }
    .service-stack-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent 45%);
      pointer-events: none;
      z-index: 1;
    }
    .service-stack-card::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 26px 26px;
      opacity: 0.18;
      mix-blend-mode: soft-light;
      pointer-events: none;
      z-index: 1;
    }
    .service-stack-inner {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      min-height: 540px;
    }
    .service-stack-copy {
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 32px;
    }
    .service-stack-meta {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      color: rgba(255,255,255,0.75);
      font-family: 'Inter', sans-serif;
      font-size: 0.76rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .service-stack-number {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 800;
      font-size: 0.95rem;
      color: #111111;
      background: rgba(255,255,255,0.78);
      border-radius: 999px;
      padding: 8px 14px;
    }
    .service-stack-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2.6rem, 4vw, 4.5rem);
      line-height: 0.98;
      letter-spacing: -0.04em;
      color: #F8FAFC;
      margin: 0 0 18px;
      text-wrap: balance;
      max-width: 10ch;
    }
    .service-stack-desc {
      font-family: 'Inter', sans-serif;
      font-size: 1.08rem;
      line-height: 1.75;
      color: rgba(226, 232, 240, 0.84);
      margin: 0;
      max-width: 58ch;
    }
    .service-stack-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .service-stack-badge {
      font-family: 'Inter', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255,255,255,0.78);
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .service-stack-card-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      z-index: 0;
      transition: transform 0.5s ease;
    }
    .service-stack-card-inner {
      position: relative;
      z-index: 2;
      height: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 42px 40px;
      box-sizing: border-box;
    }
    .service-stack-link {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 999px;
      text-decoration: none;
      color: #091018;
      background: #F8FAFC;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
      box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
    }
    .service-stack-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 24px 46px rgba(0, 0, 0, 0.3);
      background: #ffffff;
    }
    .service-stack-media {
      position: relative;
      min-height: 320px;
      overflow: hidden;
    }
    .service-stack-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.02);
    }
    .service-stack-logo-watermark {
      position: absolute;
      bottom: 36px;
      right: 36px;
      height: 72px;
      width: auto;
      opacity: 0.7;
      pointer-events: none;
      z-index: 2;
    }
    .service-stack-orbit {
      position: absolute;
      width: 520px;
      height: 520px;
      border-radius: 50%;
      right: -140px;
      top: 50%;
      transform: translateY(-50%);
      border: 1px solid rgba(255,255,255,0.18);
      opacity: 0.42;
    }
    .service-stack-orbit::before,
    .service-stack-orbit::after {
      content: "";
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.12);
      inset: 44px;
    }
    .service-stack-orbit::after {
      inset: 108px;
    }
    .service-stack-dot {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      box-shadow: 0 0 22px rgba(255,255,255,0.3);
    }
    .service-stack-dot.one { top: 84px; right: 124px; }
    .service-stack-dot.two { bottom: 134px; left: 96px; }
    .service-stack-dot.three { top: 50%; left: 42px; width: 10px; height: 10px; }

    @media (max-width: 960px) {
      .service-stack-card {
        top: 84px;
        min-height: auto !important;
        aspect-ratio: 1.5 !important;
      }
      .service-stack-card-inner {
        padding: 24px 20px !important;
        height: 100% !important;
        min-height: 100% !important;
      }
      .service-stack-card-img {
        object-fit: cover !important;
        padding: 0 !important;
      }
      .service-stack-badges {
        display: none !important;
      }
      .service-stack-inner {
        grid-template-columns: 1fr;
        min-height: auto;
      }
      .service-stack-copy {
        padding: 32px 24px 20px;
      }
      .service-stack-title {
        max-width: none;
        font-size: clamp(2.2rem, 9vw, 3.2rem);
      }
      .service-stack-media {
        min-height: 300px;
      }
      .service-stack-orbit {
        width: 360px;
        height: 360px;
        right: -120px;
      }
      .service-stack-logo-watermark {
        bottom: 20px !important;
        right: 20px !important;
        height: 36px !important;
        opacity: 0.55 !important;
      }
      .service-stack-theme-text {
        display: none !important;
      }
      .services-stack {
        gap: 20px !important;
      }
    }
    @media (max-width: 1200px) {
      .bento-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: auto;
        grid-template-areas:
          "big big"
          "tall topmid"
          "tall botmid"
          "wide wide"
          "small1 small2";
      }
    }
    @media (max-width: 768px) {
      .bento-grid {
        grid-template-columns: 1fr;
        grid-template-areas: "big" "tall" "topmid" "botmid" "wide" "small1" "small2";
      }
      .card-wide { flex-direction: column !important; align-items: flex-start; }
    }
    @media (max-width: 991px) {
      .process-grid {
        grid-template-columns: 1fr !important;
        gap: 40px !important;
        height: auto !important;
        min-height: 0 !important;
      }
      .process-image-container {
        display: none !important;
      }
      .process-grid > div:first-child > div:last-child {
        height: auto !important;
      }
    }
  `}</style>
)

const ProcessSection = ({ lang }) => {
  const t = getT(lang)
  const [activeStep, setActiveStep] = useState(0)
  const [processScrollProgress, setProcessScrollProgress] = useState(0)
  const [isMobileProcessLayout, setIsMobileProcessLayout] = useState(false)
  const processSectionRef = useRef(null)
  const processFrameRef = useRef(0)
  const processStepCount = t.timeline.steps.length

  const processImages = [
    '/images/weve-been-there.webp',
    '/images/build-step.webp',
    '/images/built-for-long-run.webp',
    '/images/more-growth.webp',
  ]

  useEffect(() => {
    const onResize = () => {
      setIsMobileProcessLayout(window.innerWidth <= 991)
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const section = processSectionRef.current
    if (!section) return

    const updateProcessScroll = () => {
      const rect = section.getBoundingClientRect()
      const totalScrollable = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1)

      let nextStep = 0
      if (isMobileProcessLayout) {
        // Mobile: find step closest to viewport center
        const cards = section.querySelectorAll('.process-step-card-item')
        const centerY = window.innerHeight / 2
        let minDistance = Infinity
        cards.forEach((cardEl, idx) => {
          const cardRect = cardEl.getBoundingClientRect()
          const cardCenter = cardRect.top + cardRect.height / 2
          const dist = Math.abs(cardCenter - centerY)
          if (dist < minDistance) {
            minDistance = dist
            nextStep = idx
          }
        })
      } else {
        // Desktop: based on sticky scroll progress
        nextStep = Math.min(processStepCount - 1, Math.round(progress * (processStepCount - 1)))
      }

      setProcessScrollProgress(prev => (Math.abs(prev - progress) > 0.002 ? progress : prev))
      setActiveStep(prev => (prev === nextStep ? prev : nextStep))
    }

    const onScroll = () => {
      if (processFrameRef.current) return
      processFrameRef.current = window.requestAnimationFrame(() => {
        processFrameRef.current = 0
        updateProcessScroll()
      })
    }

    updateProcessScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateProcessScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateProcessScroll)
      if (processFrameRef.current) {
        window.cancelAnimationFrame(processFrameRef.current)
        processFrameRef.current = 0
      }
    }
  }, [isMobileProcessLayout, processStepCount])

  return (
    <div
      ref={processSectionRef}
      style={{
        backgroundColor: '#050505',
        padding: '1px 0',
        position: 'relative',
        minHeight: isMobileProcessLayout ? 'auto' : `${Math.max(processStepCount * 100, 240)}vh`
      }}
    >
      <section className="process-section" id="how-it-works" style={{
        position: isMobileProcessLayout ? 'relative' : 'sticky',
        top: 0,
        minHeight: isMobileProcessLayout ? 'auto' : '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: isMobileProcessLayout ? '120px 24px' : '48px 24px',
        backgroundColor: '#050505',
        overflow: 'hidden'
      }}>
        {/* decorative glows */}
        <div style={{ position: 'absolute', top: '20px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(209, 187, 251,0.1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '40px', right: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(156,39,176,0.1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="process-grid" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>

          {/* Left: Steps */}
          <div>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, letterSpacing: '0.2em',
              color: '#d1bbfb', textTransform: 'uppercase', marginBottom: '20px'
            }}>
              {t.timeline.badge}
            </p>
            <h2 style={{
              fontFamily: "'Inter', sans-serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: 800, color: '#FFFFFF', marginBottom: '48px', letterSpacing: '-0.02em', lineHeight: 1.1
            }}>
              {t.timeline.title}
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              height: isMobileProcessLayout ? 'auto' : '560px',
              position: 'relative'
            }}>
              {t.timeline.steps.map((s, idx) => (
                <motion.div
                  key={idx}
                  className="process-step-card-item"
                  initial={false}
                  animate={{
                    opacity: idx <= activeStep ? 1 : 0.35,
                    y: idx <= activeStep ? 0 : 28,
                    scale: activeStep === idx ? 1 : 0.985,
                    background: activeStep === idx
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.01)',
                    borderColor: 'rgba(255, 255, 255, 0.04)',
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                  onClick={() => {
                    if (isMobileProcessLayout) setActiveStep(idx)
                  }}
                  whileHover={{ x: activeStep === idx ? 0 : 8 }}
                  style={{
                    padding: '24px 32px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    border: '1px solid',
                    position: 'relative',
                    boxShadow: activeStep === idx ? '0 20px 40px rgba(0,0,0,0.3)' : 'none',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    minHeight: '126px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: activeStep === idx ? '#d1bbfb' : '#334155'
                      }}>
                        {idx + 1}
                      </span>
                      <h3 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        margin: 0,
                        color: activeStep === idx ? '#FFFFFF' : '#475569'
                      }}>
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      opacity: activeStep === idx ? 1 : idx < activeStep ? 0.45 : 0,
                      y: activeStep === idx ? 0 : idx < activeStep ? -4 : 10
                    }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{
                      overflow: 'hidden',
                      minHeight: '52px',
                      marginTop: 16,
                      pointerEvents: 'none'
                    }}
                  >
                    <p style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#94A3B8',
                      fontSize: '1.05rem',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      {s.desc}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Dynamic Image */}
          <div className="process-image-container" style={{
            position: 'relative',
            height: '640px'
          }}>
            {/* Offset Glassmorphism Card in Background */}
            <div
              style={{
                position: 'absolute',
                inset: '24px -24px -24px 24px',
                borderRadius: '48px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
                zIndex: 0
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '48px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 50px 100px -30px rgba(0,0,0,0.8)',
                zIndex: 2,
                background: '#0a0a0a',
                willChange: 'transform, opacity'
              }}
            >
              {processImages.map((src, idx) => (
                <motion.img
                  key={src}
                  src={src}
                  alt=""
                  initial={false}
                  animate={{
                    opacity: activeStep === idx ? 1 : 0,
                    scale: activeStep === idx ? 1 : 1.045
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ))}
              <motion.div
                initial={false}
                animate={{ y: `${processScrollProgress * -24}px` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 30%, rgba(5,5,5,0.18) 100%)',
                  pointerEvents: 'none',
                  zIndex: 3
                }}
              />
              <div style={{
                position: 'absolute',
                left: '32px',
                right: '32px',
                top: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 4
              }}>
                <div style={{
                  background: 'rgba(5, 5, 5, 0.65)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '999px',
                  padding: '10px 22px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#FFFFFF'
                }}>
                  Step {activeStep + 1} / {processStepCount}
                </div>
                <div style={{
                  background: 'rgba(5, 5, 5, 0.65)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '999px',
                  padding: '10px 22px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#CBD5E1'
                }}>
                  {t.timeline.badge}
                </div>
              </div>

              <div style={{
                position: 'absolute',
                left: '32px',
                right: '32px',
                bottom: '44px',
                background: 'rgba(5, 5, 5, 0.65)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '32px',
                padding: '24px 32px',
                zIndex: 4,
                textAlign: 'left'
              }}>
                <p style={{
                  margin: 0,
                  color: '#FFFFFF',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em'
                }}>
                  {t.timeline.steps[activeStep].title}
                </p>
                <div style={{
                  margin: '12px 0 0',
                  color: 'rgba(226,232,240,0.88)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.98rem',
                  lineHeight: 1.7,
                  maxWidth: '44ch'
                }}>
                  {t.timeline.steps[activeStep].desc}
                </div>
              </div>
              {!isMobileProcessLayout && (
                <div style={{
                  position: 'absolute',
                  left: '32px',
                  right: '32px',
                  bottom: '28px',
                  height: '4px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                  zIndex: 3
                }}>
                  <motion.div
                    initial={false}
                    animate={{ width: `${Math.max(processScrollProgress, 1 / (processStepCount * 4)) * 100}%` }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, #d1bbfb, #ffffff)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

import FAQ from '../components/FAQ'

export default function Home({ lang = 'en' }) {
  const t = getT(lang)
  const trackRef = useRef(null)
  const timerRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    document.title = 'AutoFlow Studio - Automate the Work You Hate'
  }, [])

  const goTo = (idx) => {
    setCurrentSlide(idx)
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${idx * 100}%)`
    }
  }

  const DREAM_WORDS_EN = ['dreaming.', 'building.', 'creating.', 'scaling.', 'growing.', 'automating.', 'innovating.']
  const DREAM_WORDS_NL = ['dromen.', 'bouwen.', 'creëren.', 'schalen.', 'groeien.', 'automatiseren.', 'innoveren.']
  const dreamWords = lang === 'nl' ? DREAM_WORDS_NL : DREAM_WORDS_EN

  const [dreamText, setDreamText] = useState('')
  const [dreamWordIdx, setDreamWordIdx] = useState(0)
  const [dreamCharIdx, setDreamCharIdx] = useState(0)
  const [dreamDeleting, setDreamDeleting] = useState(false)

  // Typewriter effect for "dreaming."
  useEffect(() => {
    const current = dreamWords[dreamWordIdx]
    let timeout

    if (!dreamDeleting) {
      if (dreamCharIdx < current.length) {
        timeout = setTimeout(() => {
          setDreamText(current.slice(0, dreamCharIdx + 1))
          setDreamCharIdx(c => c + 1)
        }, 80) // Typing speed
      } else {
        timeout = setTimeout(() => setDreamDeleting(true), 2000) // Pause before deleting
      }
    } else {
      if (dreamCharIdx > 0) {
        timeout = setTimeout(() => {
          setDreamText(current.slice(0, dreamCharIdx - 1))
          setDreamCharIdx(c => c - 1)
        }, 40) // Deleting speed
      } else {
        setDreamDeleting(false)
        setDreamWordIdx(i => (i + 1) % dreamWords.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [dreamCharIdx, dreamDeleting, dreamWordIdx, dreamWords])

  const BUILD_WORDS_EN = ['Build.', 'Create.', 'Optimize.', 'Improve.', 'Speed Up.']
  const BUILD_WORDS_NL = ['Bouwen.', 'Creëren.', 'Optimaliseren.', 'Verbeteren.', 'Versnellen.']
  const buildWords = lang === 'nl' ? BUILD_WORDS_NL : BUILD_WORDS_EN

  const [buildText, setBuildText] = useState('')
  const [buildWordIdx, setBuildWordIdx] = useState(0)
  const [buildCharIdx, setBuildCharIdx] = useState(0)
  const [buildDeleting, setBuildDeleting] = useState(false)

  // Typewriter effect for "Build"
  useEffect(() => {
    const current = buildWords[buildWordIdx]
    let timeout

    if (!buildDeleting) {
      if (buildCharIdx < current.length) {
        timeout = setTimeout(() => {
          setBuildText(current.slice(0, buildCharIdx + 1))
          setBuildCharIdx(c => c + 1)
        }, 80) // Typing speed
      } else {
        timeout = setTimeout(() => setBuildDeleting(true), 2000) // Pause before deleting
      }
    } else {
      if (buildCharIdx > 0) {
        timeout = setTimeout(() => {
          setBuildText(current.slice(0, buildCharIdx - 1))
          setBuildCharIdx(c => c - 1)
        }, 40) // Deleting speed
      } else {
        setBuildDeleting(false)
        setBuildWordIdx(i => (i + 1) % buildWords.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [buildCharIdx, buildDeleting, buildWordIdx, buildWords])

  const startupStackCards = [
    {
      ...t.startupDreams.cards[0],
      image: '/images/startup-stack/card-1.webp',
      theme: lang === 'nl' ? 'rommel eruit' : 'fix the mess',
      tint: 'linear-gradient(135deg, #2d3444 0%, #151821 45%, #0d0f15 100%)',
      badges: lang === 'nl'
        ? ['maatwerk code', 'minder fouten', 'meer grip']
        : ['custom code', 'fewer breakages', 'more control'],
    },
    {
      ...t.startupDreams.cards[1],
      image: '/images/startup-stack/card-2.webp',
      theme: lang === 'nl' ? 'sneller live' : 'move faster',
      tint: 'linear-gradient(135deg, #4d2e28 0%, #1b1514 48%, #110e0d 100%)',
      badges: lang === 'nl'
        ? ['minder handwerk', 'snelle onboarding', 'kortere doorlooptijd']
        : ['less admin', 'faster onboarding', 'shorter cycles'],
    },
    {
      ...t.startupDreams.cards[4],
      image: '/images/startup-stack/card-3.webp',
      theme: lang === 'nl' ? 'meer groei' : 'more growth',
      tint: 'linear-gradient(135deg, #1e433d 0%, #111a1a 48%, #0b1010 100%)',
      badges: lang === 'nl'
        ? ['meer output', 'minder overhead', 'schaalbaar team']
        : ['more output', 'less overhead', 'scalable ops'],
    },
    {
      ...t.startupDreams.cards[5],
      image: '/images/startup-stack/card-4.webp',
      theme: lang === 'nl' ? 'klaar voor groei' : 'built to last',
      tint: 'linear-gradient(135deg, #36304d 0%, #17141f 46%, #0d0c12 100%)',
      badges: lang === 'nl'
        ? ['stabiele basis', 'groeit mee', 'lange termijn']
        : ['stable foundation', 'grows with you', 'long-term fit'],
    },
  ]

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % CAROUSEL_SLIDES.length
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${next * 100}%)`
        }
        return next
      })
    }, 7000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <main className="main-content">
      <FlowStyles />
      {/* ── Hero ── */}
      <Hero lang={lang} />

      {/* ── Services Orbital Section ── */}
      <section id="services" style={{
        backgroundColor: '#050505',
        padding: '120px 24px 160px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.2em',
              color: '#d1bbfb', textTransform: 'uppercase', marginBottom: '16px'
            }}>
              {t.services.badge}
            </p>
            <h2 style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em', lineHeight: 1.1
            }}>
              {t.services.title}
              <span style={{
                background: 'linear-gradient(135deg, #d1bbfb, #d1bbfb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', textAlign: 'left'
              }}>
                {buildText}<span style={{ opacity: 0.7, animation: 'blink 1s step-start infinite' }}>|</span>
              </span>
            </h2>
          </div>

          <div className="bento-grid">
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bento-card card-tall"
              style={{
                background: "url('/images/outreach-automation.webp') center center / cover no-repeat",
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.3) 50%, rgba(5,5,5,0) 100%)', zIndex: 1 }} />
              <div className="card-glow" style={{ zIndex: 1 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="bento-icon">{ICONS[t.services.items[2].icon]}</motion.div>
                <div className="badge-tag">Agents v2.1</div>
              </div>
              <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                <h3 className="bento-title">{t.services.items[2].title}</h3>
                <p className="bento-desc">{t.services.items[2].desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                  <div className="status-dot" />
                  <span style={{ fontFamily: 'Inter', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Active Inbound/Outbound</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bento-card card-topmid"
              style={{
                background: "url('/images/smart-reporting.webp') center center / cover no-repeat",
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.3) 50%, rgba(5,5,5,0) 100%)', zIndex: 1 }} />
              <div className="card-glow" style={{ background: 'radial-gradient(circle at top right, rgba(209, 187, 251, 0.1) 0%, transparent 60%)', zIndex: 1 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} className="bento-icon" style={{ marginBottom: 0 }}>{ICONS[t.services.items[1].icon]}</motion.div>
                <div className="status-dot" />
              </div>
              <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                <h3 className="bento-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.services.items[1].title}</h3>
                <p className="bento-desc" style={{ fontSize: '0.85rem' }}>{t.services.items[1].desc}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bento-card card-big"
            >
              <div className="card-glow" style={{ width: '200%', height: '200%', opacity: 1 }} />
              <div className="card-pattern" style={{ opacity: 0.5 }} />
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="400" height="400" viewBox="0 0 400 400">
                  <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="#d1bbfb" strokeWidth="2" />
                  <path d="M0,220 Q100,120 200,220 T400,220" fill="none" stroke="#d1bbfb" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <p className="bento-desc" style={{ marginBottom: '12px', fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 700, color: '#d1bbfb' }}>CORE PLATFORM</p>
                <h3 className="bento-title">{t.services.items[0].title}</h3>
                <p className="bento-desc" style={{ fontSize: '1rem', maxWidth: '360px', margin: '0 auto', opacity: 0.9 }}>
                  {t.services.items[0].desc}
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
                  <div className="badge-tag">Scalable</div>
                  <div className="badge-tag">Secure</div>
                  <div className="badge-tag">Real-time</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bento-card card-botmid"
            >
              <div className="card-glow" style={{ background: 'radial-gradient(circle at bottom left, rgba(209, 187, 251, 0.1) 0%, transparent 60%)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} className="bento-icon" style={{ marginBottom: 0 }}>{ICONS[t.services.items[4].icon]}</motion.div>
                <div className="badge-tag">Pipes</div>
              </div>
              <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                <h3 className="bento-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.services.items[4].title}</h3>
                <p className="bento-desc" style={{ fontSize: '0.85rem' }}>{t.services.items[4].desc}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 10 }}
              className="bento-card card-wide"
            >
              <div className="card-glow" style={{ left: '-50%', width: '100%', height: '100%' }} />
              <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="bento-icon" style={{ position: 'relative', zIndex: 2 }}>{ICONS[t.services.items[3].icon]}</motion.div>
              <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                <h3 className="bento-title" style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{t.services.items[3].title}</h3>
                <p className="bento-desc">{t.services.items[3].desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.8, position: 'relative', zIndex: 2 }}>
                <div className="badge-tag">Self-Learning</div>
                <div className="badge-tag">24/7 Active</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bento-card card-small1"
            >
              <div className="card-pattern" style={{ opacity: 0.2 }} />
              <h3 className="bento-title" style={{ position: 'relative', zIndex: 2 }}>{t.services.items[5].title}</h3>
              <p className="bento-desc" style={{ position: 'relative', zIndex: 2 }}>{t.services.items[5].desc}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bento-card card-small2"
            >
              <div className="card-pattern" style={{ opacity: 0.2 }} />
              <h3 className="bento-title" style={{ position: 'relative', zIndex: 2 }}>{t.services.items[6].title}</h3>
              <p className="bento-desc" style={{ position: 'relative', zIndex: 2 }}>{t.services.items[6].desc}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Process Section ── */}
      <ProcessSection lang={lang} />

      {/* ── Startup Dreams Section ── */}
      <section style={{ backgroundColor: '#050505', padding: '120px 24px', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em',
              color: '#64748B', textTransform: 'uppercase', marginBottom: '16px'
            }}>
              {t.startupDreams.superTitle}
            </p>
            <h2 style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: 'clamp(3rem, 5vw, 4rem)',
              fontWeight: 800, color: '#F8FAFC', marginBottom: '24px', letterSpacing: '-0.02em', lineHeight: 1.1
            }}>
              {t.startupDreams.title}
              <span style={{
                background: 'linear-gradient(135deg, #d1bbfb, #d1bbfb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', minWidth: '4ch', textAlign: 'left'
              }}>
                {dreamText}<span style={{ opacity: 0.7, animation: 'blink 1s step-start infinite' }}>|</span>
              </span>
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: '1.15rem', color: '#94A3B8',
              maxWidth: '600px', margin: '0 auto', lineHeight: 1.6
            }}>
              {t.startupDreams.sub}
            </p>
          </div>

          <div className="services-stack" style={{ maxWidth: '1180px', margin: '0 auto 60px' }}>
            {startupStackCards.map((card, idx) => (
              <article
                key={card.title}
                className="service-stack-card"
                style={{
                  top: `${96 + idx * 64}px`,
                  background: card.tint,
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  width="800"
                  height="533"
                  className="service-stack-card-img"
                />
                <div className="service-stack-card-inner">
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(5,5,5,0.08) 0%, rgba(5,5,5,0.04) 22%, rgba(5,5,5,0.54) 72%, rgba(5,5,5,0.76) 100%)',
                    zIndex: -1
                  }} />
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '32px',
                    flex: 1
                  }}>
                    <div className="service-stack-meta">
                      <span className="service-stack-number">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="service-stack-theme-text">{card.theme}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      textAlign: 'center',
                      gap: '24px',
                      flex: 1,
                      paddingBottom: '8px'
                    }}>
                      <div className="service-stack-badges" style={{ justifyContent: 'center', margin: 0 }}>
                        {card.badges.map(badge => (
                          <span key={badge} className="service-stack-badge">{badge}</span>
                        ))}
                      </div>

                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                        className="service-stack-link"
                        style={{ alignSelf: 'center', border: 'none', cursor: 'pointer' }}
                      >
                        {lang === 'nl' ? 'Plan nu een gesprek' : 'Book a call now'}
                        <span aria-hidden="true" style={{ marginLeft: '6px' }}>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Logo watermark — bottom-right */}
                  <img
                    src="/images/logo.webp"
                    alt=""
                    width="72"
                    height="72"
                    aria-hidden="true"
                    className="service-stack-logo-watermark"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>


      </section>

      {/* ── Case Studies Carousel (Hidden for now) ── */}
      {false && (
        <section className="work-examples">
          <div className="container">
            <h2 className="section-title" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{t.caseStudies.title}</h2>
            <p className="section-subtitle" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.caseStudies.sub}</p>
          </div>
          <div className="carousel-container">
            <div className="carousel-wrapper">
              <div className="carousel-track" ref={trackRef} id="carouselTrack">
                {CAROUSEL_SLIDES.map((s, i) => (
                  <div key={i} className="carousel-slide" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
                  }}>
                    <div className="video-container">
                      <div className="video-wrapper">
                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#111', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${s.videoId}?rel=0&modestbranding=1&color=white`}
                            title={s.videoTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, border: 'none' }}
                          />
                        </div>
                        <div className="video-title" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{s.videoTitle}</div>
                        <div className="video-description">{s.videoDesc}</div>
                      </div>
                    </div>
                    <div className="work-content">
                      <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{s.title}</h2>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.desc}</p>
                      <div className="work-stats">
                        {s.stats.map((st, j) => (
                          <div key={j} className="stat-item">
                            <div className="stat-number" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>{st.n}</div>
                            <div className="stat-label" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{st.l}</div>
                          </div>
                        ))}
                      </div>
                      <Link to={s.href} className="cta-button">View Case Study</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls — now with reactive dots */}
            <div className="carousel-controls">
              <button className="carousel-button" onClick={() => goTo((currentSlide - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}>‹</button>
              <div className="carousel-indicators">
                {CAROUSEL_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    style={{
                      width: i === currentSlide ? '28px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: i === currentSlide
                        ? 'linear-gradient(135deg,#d1bbfb,#d1bbfb)'
                        : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
              <button className="carousel-button" onClick={() => goTo((currentSlide + 1) % CAROUSEL_SLIDES.length)}>›</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {/*
      <section style={{
        backgroundColor: '#050505',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(209, 187, 251,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(156,39,176,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px', padding: '0 24px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", color: '#F8FAFC', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.03em' }}>
              {t.testimonials.title}<br />
              <span style={{
                background: 'linear-gradient(135deg, #d1bbfb 20%, #a78bfa 80%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                marginTop: '8px'
              }}>
                {t.testimonials.sub}
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ overflow: 'hidden', padding: '10px 0' }}>
              <motion.div
                animate={{ x: [0, -7040] }}
                transition={{
                  duration: 150,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ display: 'flex', width: 'max-content', willChange: 'transform' }}
              >
                {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, i) => (
                  <div key={`top-${i}`} style={{ paddingRight: '20px', flexShrink: 0 }}>
                    <div style={{
                      width: '420px',
                      height: '100%',
                      background: '#111111',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '32px',
                      padding: '32px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '18px',
                            background: `linear-gradient(135deg, ${testimonial.color}, #d1bbfb)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: 'white',
                            boxShadow: `0 10px 20px ${testimonial.color}44`
                          }}>
                            {testimonial.initials}
                          </div>
                          <div>
                            <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1.05rem' }}>{testimonial.name}</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 500 }}>{testimonial.role}</div>
                          </div>
                        </div>
                        <p style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: '#CBD5E1',
                          lineHeight: 1.6,
                          fontSize: '0.95rem',
                          margin: 0,
                          fontWeight: 400
                        }}>
                          "{testimonial.text}"
                        </p>
                      </div>
                      <Stars />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div style={{ overflow: 'hidden', padding: '10px 0' }}>
              <motion.div
                animate={{ x: [-7040, 0] }}
                transition={{
                  duration: 180,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ display: 'flex', width: 'max-content', willChange: 'transform' }}
              >
                {[...[...TESTIMONIALS].reverse(), ...[...TESTIMONIALS].reverse()].map((testimonial, i) => (
                  <div key={`bot-${i}`} style={{ paddingRight: '20px', flexShrink: 0 }}>
                    <div style={{
                      width: '420px',
                      height: '100%',
                      background: '#111111',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '32px',
                      padding: '32px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '18px',
                            background: `linear-gradient(135deg, ${testimonial.color}, #d1bbfb)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: 'white',
                            boxShadow: `0 10px 20px ${testimonial.color}44`
                          }}>
                            {testimonial.initials}
                          </div>
                          <div>
                            <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1.05rem' }}>{testimonial.name}</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 500 }}>{testimonial.role}</div>
                          </div>
                        </div>
                        <p style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: '#CBD5E1',
                          lineHeight: 1.6,
                          fontSize: '0.95rem',
                          margin: 0,
                          fontWeight: 400
                        }}>
                          "{testimonial.text}"
                        </p>
                      </div>
                      <Stars />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

          </div>
        </div>

        <style>{`
          .testimonials-row::-webkit-scrollbar { display: none; }
          .testimonials-row { -ms-overflow-style: none; scrollbar-width: none; }
          
          @media (max-width: 991px) {
            .process-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
              height: auto !important;
              min-height: 0 !important;
            }
            .process-image-container {
              display: none !important;
            }
            .process-grid > div:first-child > div:last-child {
              height: auto !important;
            }
          }
        `}</style>
      </section>

      {/* ── FAQ ── */}
      <FAQ lang={lang} />

      {/* ── Booking CTA ── */}
      {/* ── Booking CTA ── */}
      <section id="booking" style={{ padding: '96px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(135deg, #131024, #08070d)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '3rem',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '48px 24px'
          }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(209, 187, 251, 0.15) 0%, transparent 70%)'
              }}></div>
              {/* Dot Grid */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'radial-gradient(rgba(209, 187, 251, 0.1) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            {/* Glowing blur spheres */}
            <div style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '380px',
              height: '380px',
              background: 'rgba(209, 187, 251, 0.18)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              pointerEvents: 'none',
              mixBlendMode: 'screen'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '380px',
              height: '380px',
              background: 'rgba(121, 73, 218, 0.15)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              pointerEvents: 'none',
              mixBlendMode: 'screen'
            }}></div>

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 18px',
                borderRadius: '50px',
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '28px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {lang === 'nl' ? 'BEPERKTE CAPACITEIT' : 'Limited Monthly Spots'}
              </span>

              <h2 style={{
                fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif",
                fontSize: 'clamp(2.5rem, 6.5vw, 4.8rem)',
                fontWeight: 'normal',
                color: '#FFFFFF',
                marginBottom: '24px',
                lineHeight: 1.05,
                letterSpacing: '0.02em',
                textShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}>
                {t.blog.ctaTitle}
              </h2>

              <p style={{
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                marginBottom: '40px',
                maxWidth: '620px',
                margin: '0 auto 40px',
                lineHeight: 1.6
              }}>
                {t.blog.ctaSub}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking'))}
                  className="cta-button"
                  style={{
                    padding: '20px 48px',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--primary-gradient)',
                    boxShadow: '0 10px 30px var(--primary-glow)',
                    borderRadius: '50px',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {t.blog.ctaBtn}
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide-arrow-right" style={{ transition: 'transform 0.2s' }}>
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>

              <p style={{ marginTop: '28px', fontSize: '0.8rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
                {lang === 'nl'
                  ? 'Geen commitment vereist. 100% op maat gemaakte automatisering audit.'
                  : 'No credit card or commitment required. 100% free automation roadmap.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
