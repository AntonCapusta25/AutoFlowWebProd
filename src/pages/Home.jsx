import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import BookingForm from '../components/BookingForm'
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
  { name: 'Sarah Chen', role: 'E-commerce Founder', text: 'AutoFlow Studio automated our entire order processing workflow. What used to take our team 3 hours daily now happens automatically in minutes.', initials: 'SC', color: '#e91e63' },
  { name: 'Marcus Rodriguez', role: 'Operations Manager', text: 'The Google Sheets automation they built saves us 15 hours per week. The ROI was immediate and the support has been fantastic.', initials: 'MR', color: '#e91e63' },
  { name: 'Lisa Park', role: 'Startup Founder', text: 'Finally, someone who understands both the technical side and business needs. They delivered exactly what we needed, on time.', initials: 'LP', color: '#e91e63' },
  { name: 'David Müller', role: 'Head of Operations', text: 'Incredible work on our CRM integration. We went from manual data entry to fully automated pipelines in under a week.', initials: 'DM', color: '#7c3aed' },
  { name: 'Emma Visser', role: 'CEO, Homemade BV', text: 'The outreach automation they built scaled our pipeline 10x without adding headcount. Genuinely impressive execution.', initials: 'EV', color: '#0ea5e9' },
  { name: 'Tom Bakker', role: 'Co-founder', text: 'Clean, fast, and exactly what we asked for. They even suggested improvements we hadn\'t thought of. Will work with them again.', initials: 'TB', color: '#10b981' },
]

const Stars = () => (
  <div style={{ display: 'flex', gap: '3px', marginTop: '12px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#e91e63" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
)

const FlowStyles = () => (
  <style>{`
    @keyframes super-flow {
      0% { transform: translateX(-20px); opacity: 0.1; stroke: #e91e63; }
      50% { transform: translateX(0); opacity: 1; stroke: #e91e63; stroke-width: 3px; }
      100% { transform: translateX(20px); opacity: 0.1; stroke: #e91e63; }
    }
    .process-arrow-animated {
      animation: super-flow 1.5s infinite ease-in-out !important;
      filter: drop-shadow(0 0 8px rgba(233, 30, 99, 0.6)) !important;
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
      border-color: rgba(233, 30, 99, 0.4);
    }
    .card-glow {
      position: absolute;
      width: 150%;
      height: 150%;
      background: radial-gradient(circle at center, rgba(233, 30, 99, 0.08) 0%, transparent 60%);
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
      background: rgba(233, 30, 99, 0.1);
      border: 1px solid rgba(233, 30, 99, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e91e63;
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
      background: #e91e63;
      box-shadow: 0 0 10px rgba(233, 30, 99, 0.5);
    }
    .badge-tag {
      font-family: 'Inter', sans-serif;
      background: rgba(233, 30, 99, 0.1);
      border: 1px solid rgba(233, 30, 99, 0.2);
      color: #e91e63;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      z-index: 2;
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
  `}</style>
)

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
              color: '#e91e63', textTransform: 'uppercase', marginBottom: '16px'
            }}>
              {t.services.badge}
            </p>
            <h2 style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em', lineHeight: 1.1
            }}>
              {t.services.title}
              <span style={{
                background: 'linear-gradient(135deg, #e91e63, #e91e63)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', textAlign: 'left'
              }}>
                {buildText}<span style={{ opacity: 0.7, animation: 'blink 1s step-start infinite' }}>|</span>
              </span>
            </h2>
          </div>

          <div className="bento-grid">
            {/* 1. Tall Card - Outreach Automation */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bento-card card-tall"
              style={{
                background: "url('/images/outreach-automation.png') center center / cover no-repeat",
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

            {/* 2. Top Mid - Smart Reporting */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bento-card card-topmid"
              style={{
                background: "url('/images/smart-reporting.png') center center / cover no-repeat",
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.3) 50%, rgba(5,5,5,0) 100%)', zIndex: 1 }} />
              <div className="card-glow" style={{ background: 'radial-gradient(circle at top right, rgba(233, 30, 99, 0.1) 0%, transparent 60%)', zIndex: 1 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} className="bento-icon" style={{ marginBottom: 0 }}>{ICONS[t.services.items[1].icon]}</motion.div>
                <div className="status-dot" />
              </div>
              <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                <h3 className="bento-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.services.items[1].title}</h3>
                <p className="bento-desc" style={{ fontSize: '0.85rem' }}>{t.services.items[1].desc}</p>
              </div>
            </motion.div>

            {/* 3. Big Featured - Custom CRM Systems */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bento-card card-big"
            >
              <div className="card-glow" style={{ width: '200%', height: '200%', opacity: 1 }} />
              <div className="card-pattern" style={{ opacity: 0.5 }} />
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="400" height="400" viewBox="0 0 400 400">
                  <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="#e91e63" strokeWidth="2" />
                  <path d="M0,220 Q100,120 200,220 T400,220" fill="none" stroke="#e91e63" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <p className="bento-desc" style={{ marginBottom: '12px', fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 700, color: '#e91e63' }}>CORE PLATFORM</p>
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

            {/* 4. Bot Mid - Website Integrations */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bento-card card-botmid"
            >
              <div className="card-glow" style={{ background: 'radial-gradient(circle at bottom left, rgba(233, 30, 99, 0.1) 0%, transparent 60%)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <motion.div whileHover={{ scale: 1.1 }} className="bento-icon" style={{ marginBottom: 0 }}>{ICONS[t.services.items[4].icon]}</motion.div>
                <div className="badge-tag">Pipes</div>
              </div>
              <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                <h3 className="bento-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.services.items[4].title}</h3>
                <p className="bento-desc" style={{ fontSize: '0.85rem' }}>{t.services.items[4].desc}</p>
              </div>
            </motion.div>

            {/* 5. Wide Card - AI Chatbots */}
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

            {/* 6. Small 1 - Custom Business Workflows */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bento-card card-small1"
            >
              <div className="card-pattern" style={{ opacity: 0.2 }} />
              <h3 className="bento-title" style={{ position: 'relative', zIndex: 2 }}>{t.services.items[5].title}</h3>
              <p className="bento-desc" style={{ position: 'relative', zIndex: 2 }}>{t.services.items[5].desc}</p>
            </motion.div>

            {/* 7. Small 2 - Performance Analytics */}
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
                background: 'linear-gradient(135deg, #e91e63, #e91e63)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', minWidth: '4ch', textAlign: 'left'
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

          {/* Cards Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px 32px', marginBottom: '60px'
          }}>
            {t.startupDreams.cards.map((card, i) => (
              <Link key={i} to={lang === 'nl' ? '/nl/contact' : '/contact'} style={{ textDecoration: 'none', display: 'flex' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  width: '100%',
                  minHeight: '360px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
                  background: `url('/images/${card.img}') center center / cover no-repeat`,
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  cursor: 'pointer'
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(233,30,99,0.4)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.4) 50%, rgba(5,5,5,0) 100%)',
                    zIndex: 1
                  }} />
                  <div style={{ position: 'relative', zIndex: 2, padding: '32px 24px' }}>
                    <h3 style={{
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC',
                      marginBottom: '12px', letterSpacing: '-0.01em'
                    }}>
                      {card.title}
                    </h3>
                    <p style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: '#E2E8F0', lineHeight: 1.6
                    }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium Bottom Banner */}
        <div style={{ marginTop: '50px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Link to={lang === 'nl' ? '/nl/contact' : '/contact'} style={{ textDecoration: 'none', width: '100%', maxWidth: '1200px' }}>
            <div style={{
              width: '100%', borderRadius: '32px', overflow: 'hidden', position: 'relative',
              minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '60px 80px',
              background: `url('/images/${t.startupDreams.banner.img}') center center / cover no-repeat`,
              backgroundColor: '#050505',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.8)',
              transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.borderColor = 'rgba(233,30,99,0.4)'; e.currentTarget.style.boxShadow = 'inset 0 0 100px rgba(0,0,0,0.4), 0 50px 100px rgba(0,0,0,0.9)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.boxShadow = 'inset 0 0 100px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.8)'; }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 40%, rgba(5,5,5,0) 100%)' }} />
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', textAlign: 'left' }}>
                <h3 style={{
                  fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#F8FAFC',
                  marginBottom: '12px', letterSpacing: '-0.02em', lineHeight: 1.1
                }}>
                  {t.startupDreams.banner.title}
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '1.2rem', color: '#CBD5E1', lineHeight: 1.5, opacity: 0.9
                }}>
                  {t.startupDreams.banner.sub}
                </p>
              </div>
            </div>
          </Link>
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
                        ? 'linear-gradient(135deg,#e91e63,#e91e63)'
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

      {/* ── Process Wrapper to fix grey margins ── */}
      <div style={{ backgroundColor: '#050505', padding: '1px 0' }}>
        <section className="process-section" id="how-it-works" style={{
          position: 'relative',
          minHeight: '75vh',
          background: `url('/images/process-bg.jpg') center center / cover no-repeat`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '120px 80px 100px',
          maxWidth: '1200px',
          width: 'calc(100% - 48px)',
          margin: '100px auto',
          borderRadius: '40px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)'
        }}>
          {/* Dark overlay fading to the right */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0) 100%)',
            zIndex: 1
          }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>

            <div style={{ marginBottom: 'auto' }}>
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em',
                color: '#e91e63', textTransform: 'uppercase', marginBottom: '20px'
              }}>
                {t.timeline.badge}
              </p>
              <h2 style={{
                fontFamily: "'Inter', sans-serif", fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                fontWeight: 700, color: '#FFFFFF', marginBottom: '32px', letterSpacing: '-0.02em', lineHeight: 1.1,
                maxWidth: '600px'
              }}>
                {t.timeline.title}
              </h2>
            </div>

            <div className="process-steps-container">
              {t.timeline.steps.map((s, idx) => (
                <div key={idx} className="process-step">
                  <div className="process-icon-wrapper">
                    <div className="process-icon-circle">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e0e0e0' }}>
                        {idx === 0 && <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                        {idx === 1 && <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />}
                        {idx === 2 && <> <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> </>}
                        {idx === 3 && <> <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> </>}
                      </svg>
                    </div>
                    {idx < t.timeline.steps.length - 1 && (
                      <div className="process-connector">
                        <svg className="process-arrow-animated" width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="rgba(156, 39, 176, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="0" y1="12" x2="36" y2="12"></line>
                          <polyline points="28 4 36 12 28 20"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="process-step-number">0{idx + 1}</div>
                  <h3 className="process-step-title">{s.title}</h3>
                  <p className="process-step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Testimonials ── */}
      <section style={{
        backgroundColor: '#050505',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative glows */}
        <div style={{ position: 'absolute', top: '20px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(233,30,99,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(156,39,176,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", color: '#F8FAFC', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px' }}>
              {t.testimonials.title}<br />
              <span style={{ background: 'linear-gradient(135deg,#e91e63,#e91e63)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t.testimonials.sub}
              </span>
            </h2>
          </div>

          {/* Top row — 3 cards, middle one slightly elevated */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '20px' }} className="testimonials-top-row">
            {TESTIMONIALS.slice(0, 3).map((testimonial, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '28px',
                transform: i === 1 ? 'translateY(-12px)' : 'none',
                boxShadow: i === 1
                  ? 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 40px 80px rgba(0,0,0,0.9)'
                  : 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = i === 1 ? 'translateY(-18px)' : 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 20px rgba(255,255,255,0.25), 0 40px 80px rgba(0,0,0,0.9)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = i === 1 ? 'translateY(-12px)' : 'none';
                  e.currentTarget.style.boxShadow = i === 1
                    ? 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 40px 80px rgba(0,0,0,0.9)'
                    : 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg,${testimonial.color},#e91e63)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '0.95rem' }}>{testimonial.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{testimonial.role}</div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#CBD5E1', lineHeight: 1.7, fontSize: '0.875rem', margin: 0 }}>{testimonial.text}</p>
                <Stars />
              </div>
            ))}
          </div>

          {/* Bottom row — 3 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="testimonials-top-row">
            {TESTIMONIALS.slice(3).map((testimonial, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '28px',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 20px rgba(255,255,255,0.25), 0 40px 80px rgba(0,0,0,0.9)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: `linear-gradient(135deg,${testimonial.color},#e91e63)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '0.95rem' }}>{testimonial.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{testimonial.role}</div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#CBD5E1', lineHeight: 1.7, fontSize: '0.875rem', margin: 0 }}>{testimonial.text}</p>
                <Stars />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .testimonials-top-row { grid-template-columns: 1fr !important; }
            .testimonials-top-row > div { transform: none !important; }
          }
        `}</style>
      </section>

      {/* ── FAQ ── */}
      <FAQ lang={lang} />

      {/* ── Booking CTA ── */}
      <section id="booking" className="booking-section">
        <div className="booking-bg-decoration">
          <div className="booking-circle-1" /><div className="booking-circle-2" /><div className="booking-noise" />
        </div>
        <div className="booking-container">
          <div className="booking-flex">
            <div className="booking-text">
              <h2 className="booking-title" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                {t.booking.title} <br /><span className="text-gradient">{t.booking.highlight}</span>
              </h2>
              <p className="booking-description" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.booking.sub}</p>
              <div className="booking-features">
                <div className="feature-pill"><div className="pill-icon">⭐</div><span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.booking.feat1}</span></div>
                <div className="feature-pill"><div className="pill-icon">⚡</div><span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.booking.feat2}</span></div>
              </div>
            </div>
            <div className="booking-form-wrapper">
              <div className="form-glass-container">
                <div className="form-inner">
                  <BookingForm lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
