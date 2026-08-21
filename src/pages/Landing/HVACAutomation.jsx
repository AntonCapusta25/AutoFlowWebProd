import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/landing-b2b.css'

const TRANSLATIONS = {
  en: {
    meta: {
      title: "Scale Your HVAC & Field Operations Without the Dispatch Tax | AutoFlow Studio",
      desc: "Stop wasting dispatch hours on back-and-forth phone calls and paper job sheets. We build custom field portals, bespoke technician schedulers, and automated billing integrations tailored to your business rules."
    },
    nav: {
      solutions: "Solutions",
      painPoints: "The Problem",
      roi: "ROI Calculator",
      contact: "Get Started"
    },
    hero: {
      eyebrow: "Field Service & HVAC Automation",
      heading: "Scale Field Operations Without the ",
      headingHighlight: "Dispatch Tax",
      desc: "Tired of lost work orders, messy travel coordination, and delayed billing? We design and engineer premium custom dispatch dashboards, mobile technician portals, and secure invoice integrations that run your field business on autopilot.",
      ctaPrimary: "Book an Operations Audit",
      ctaSecondary: "Calculate Your ROI"
    },
    pains: {
      title: "Why Traditional Field Service Scaling Fails",
      subtitle: "The more jobs you win, the more coordination friction your office staff encounters. Hiring more dispatchers to copy-paste job details to techs is a temporary band-aid, not a scaling strategy.",
      card1: {
        title: "Lost Work Orders & Notes",
        desc: "Technicians logging details on paper or messaging apps leads to delayed invoicing, lost photos, and missing sign-offs."
      },
      card2: {
        title: "Dispatch Coordinator Overhead",
        desc: "Your back-office spends hours calling techs, updating customers, and manually syncing schedules across disconnected calendars."
      },
      card3: {
        title: "Delayed Cash Flow Loop",
        desc: "Days or weeks pass between a job being completed and the invoice actually being sent, approved, and paid by the client."
      }
    },
    solutions: {
      title: "Engineered For Field Efficiency",
      subtitle: "We replace manual dispatch and paper logs with custom software assets that your company owns forever. No licensing limits, infinite integration freedom.",
      portal: {
        title: "Mobile Technician Portals",
        desc: "Give your techs a lightweight mobile app to view assigned jobs, log parts/labor, upload job photos, and capture customer signatures on site."
      },
      crm: {
        title: "Bespoke Dispatch Dashboards",
        desc: "Proprietary schedules modeled around your technicians' skills, zones, and availability. Drag-and-drop dispatch with live status updates."
      },
      integrations: {
        title: "Native Accounting & Payment Sync",
        desc: "Securely link your technician status changes to trigger immediate billing inside Moneybird, Exact, Mollie, or Stripe."
      },
      docs: {
        title: "Automated Service Certificates",
        desc: "Instantly compile, sign, and deliver beautifully formatted PDF job sheets, safety checks, or quote proposals right from the field."
      }
    },
    roi: {
      title: "Calculate Your Annual Dispatch Leak",
      subtitle: "Adjust the sliders below to see how much capital your business is wasting on manual service coordination every single year.",
      employees: "Number of Field Technicians",
      hours: "Hours Wasted/Tech/Week (Admin/Travel)",
      labor: "Average Technical Hourly Cost",
      wastedCost: "Annual Cost of Manual Overhead",
      savingTitle: "Expected Savings With AutoFlow",
      savingSub: "By automating dispatch scheduling, mobile reports, and billing syncs, you typically recapture 85% of this lost capital.",
      cta: "Recapture This Waste Now"
    },
    steps: {
      title: "The Path to Automated Operations",
      step1: {
        title: "Operational Audit",
        desc: "We analyze your dispatch loops, field logs, and billing bottlenecks to identify the quiet time-wasters."
      },
      step2: {
        title: "High-End Blueprint",
        desc: "We design pixel-perfect mockups and interactive wireframes of your custom technician app before writing code."
      },
      step3: {
        title: "System Engineering",
        desc: "We develop secure, offline-friendly mobile dashboards and blindingly fast back-office dispatch software."
      },
      step4: {
        title: "Autonomous Launch",
        desc: "Your custom dashboard launches, webhooks sync Mollie/Exact, and your technicians operate on autopilot."
      }
    },
    cta: {
      title: "Ready to Automate Your Field Service?",
      desc: "Stop paying high licensing fees on rigid field management apps. Let's design and build a custom system that fits your team perfectly.",
      button: "Schedule a Discovery Call"
    }
  },
  nl: {
    meta: {
      title: "Schaal je installatie- en veldwerkzaamheden zonder dispatch-druk | AutoFlow Studio",
      desc: "Verspil geen kostbare tijd aan heen-en-weer bellen en papieren bonnen. Wij bouwen mobiele werkbonnen-portalen en automatische facturatiesystemen op maat."
    },
    nav: {
      solutions: "Oplossingen",
      painPoints: "Het Probleem",
      roi: "ROI Calculator",
      contact: "Aan de slag"
    },
    hero: {
      eyebrow: "Veldservice & HVAC Automatisering",
      heading: "Schaal je velddienst zonder extra ",
      headingHighlight: "Dispatch-druk",
      desc: "Moe van verloren werkbonnen, handmatige planning en trage facturatie? Wij ontwerpen en bouwen op maat gemaakte dispatch dashboards, mobiele monteursportalen en automatische koppelingen waarmee je bedrijf op autopilot draait.",
      ctaPrimary: "Boek een Operations Audit",
      ctaSecondary: "Bereken je ROI"
    },
    pains: {
      title: "Waarom Traditioneel Schalen in Veldservice Mislukt",
      subtitle: "Hoe meer klussen je aanneemt, hoe meer administratieve rompslomp er ontstaat op kantoor. Meer planners aannemen om monteurs handmatig aan te sturen is een tijdelijke pleister, geen schaalbare strategie.",
      card1: {
        title: "Verloren Werkbonnen",
        desc: "Monteurs die uren en materialen op papier of WhatsApp bijhouden zorgen voor trage facturatie, missende foto's en ontbrekende handtekeningen."
      },
      card2: {
        title: "Hoge Dispatch Overhead",
        desc: "Planners op kantoor besteden uren aan het bellen van monteurs, het updaten van klanten en het handmatig synchroniseren van agenda's."
      },
      card3: {
        title: "Trage Facturatie Loop",
        desc: "Er gaan dagen of weken voorbij tussen het afronden van de klus en het daadwerkelijk versturen en betaald krijgen van de factuur."
      }
    },
    solutions: {
      title: "Gebouwd Voor absolute Efficiëntie",
      subtitle: "Wij vervangen handmatige planning en papieren urenregistraties door op maat gemaakte software-assets die je voor altijd bezit. Geen licentielimieten.",
      portal: {
        title: "Mobiele Werkbonnen",
        desc: "Geef monteurs een gebruiksvriendelijk mobiel portaal om toegewezen klussen te bekijken, materialen/uren te loggen en handtekeningen van klanten te verzamelen."
      },
      crm: {
        title: "Op Maat Dispatch Dashboards",
        desc: "Een dispatch-bord dat perfect aansluit op de vaardigheden, regio's en beschikbaarheid van je monteurs. Sleep-en-neerzet planning met live updates."
      },
      integrations: {
        title: "Native Exact & Mollie Sync",
        desc: "Koppel statuswijzigingen van monteurs direct aan het versturen van facturen en betalingen via Moneybird, Exact of Mollie."
      },
      docs: {
        title: "Automatische Werkrapporten",
        desc: "Genereer en lever direct professionele PDF-werkbonnen, keuringsrapporten of offertes aan de klant, direct vanuit het veld."
      }
    },
    roi: {
      title: "Bereken je Jaarlijkse Dispatch Lek",
      subtitle: "Verschuif de regelaars hieronder om te zien hoeveel uren en kapitaal er jaarlijks verloren gaan aan handmatige coördinatie.",
      employees: "Aantal Monteurs in het Veld",
      hours: "Uren Verloren/Monteur/Week (Admin/Reis)",
      labor: "Gemiddeld Intern Uurtarief",
      wastedCost: "Jaarlijkse Kosten handmatige Overhead",
      savingTitle: "Verwachte Besparing Met AutoFlow",
      savingSub: "Door het automatiseren van dispatch-planners, mobiele formulieren en facturen win je doorgaans 85% van dit verloren kapitaal terug.",
      cta: "Win Deze Verspilling Nu Terug"
    },
    steps: {
      title: "De Route Naar Geautomatiseerde Groei",
      step1: {
        title: "Operationele Audit",
        desc: "We analyseren je dispatch- en facturatieprocessen om de grootste tijdverspillers in kaart te brengen."
      },
      step2: {
        title: "Hoogwaardig Ontwerp",
        desc: "We ontwerpen pixel-perfecte mockups en interactieve wireframes van je monteur-app voordat we gaan bouwen."
      },
      step3: {
        title: "Systeembouw",
        desc: "We bouwen veilige, offline-vriendelijke mobiele dashboards en razendsnelle backoffice planningstools."
      },
      step4: {
        title: "Autonome Lancering",
        desc: "Je dashboard gaat live, webhooks synchroniseren Mollie/Exact en je monteurs werken volledig op autopilot."
      }
    },
    cta: {
      title: "Klaar Om Je Velddienst te Automatiseren?",
      desc: "Stop met het betalen van dure licenties per monteur voor systemen die niet passen. Laten we jouw perfecte veldservice-systeem bouwen.",
      button: "Plan je Discovery Call"
    }
  }
}

export default function HVACAutomation({ lang }) {
  const navigate = useNavigate()
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  // ROI Calculator States
  const [employees, setEmployees] = useState(12)
  const [hours, setHours] = useState(5)
  const [labor, setLabor] = useState(55)

  const [wastedCost, setWastedCost] = useState(0)
  const [savings, setSavings] = useState(0)

  useEffect(() => {
    const annualWasted = employees * hours * labor * 52
    setWastedCost(annualWasted)
    setSavings(Math.round(annualWasted * 0.85))
  }, [employees, hours, labor])

  useEffect(() => {
    document.title = t.meta.title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', t.meta.desc)
    }
  }, [lang])

  const openBooking = () => {
    window.dispatchEvent(
      new CustomEvent('open-booking', {
        detail: { query: 'HVAC & Field Service Operations Audit request from Standalone Landing Page' }
      })
    )
  }

  const switchLang = (toLang) => {
    if (toLang === 'nl') {
      navigate('/nl/solutions/hvac-field-services')
    } else {
      navigate('/solutions/hvac-field-services')
    }
  }

  return (
    <div className="b2b-landing red-landing">
      {/* ── Standalone Glass Navigation ── */}
      <nav className="b2b-nav">
        <Link to={lang === 'nl' ? '/nl' : '/'} className="b2b-nav-logo">
          <img src="/images/logo.png" alt="AutoFlow Studio Logo" />
        </Link>
        <ul className="b2b-nav-links">
          <li><a href="#solutions">{t.nav.solutions}</a></li>
          <li><a href="#problem">{t.nav.painPoints}</a></li>
          <li><a href="#roi">{t.nav.roi}</a></li>
          <li><button onClick={openBooking} className="b2b-nav-cta">{t.nav.contact}</button></li>
          <li>
            <button 
              onClick={() => switchLang(lang === 'en' ? 'nl' : 'en')}
              className="b2b-lang-switch"
            >
              {lang === 'en' ? 'NL' : 'EN'}
            </button>
          </li>
        </ul>
      </nav>

      {/* ── Hero Section ── */}
      <section className="b2b-section" style={{ paddingTop: '180px', paddingBottom: '100px' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
            <span className="b2b-tag">{t.hero.eyebrow}</span>
            <h1 style={{ fontSize: '3.4rem', lineHeight: '1.15', marginBottom: '24px', letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.hero.heading}
              <span style={{ color: 'var(--b2b-primary)', fontStyle: 'italic', display: 'block' }}>{t.hero.headingHighlight}</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--b2b-text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
              {t.hero.desc}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={openBooking} className="b2b-btn-primary">{t.hero.ctaPrimary}</button>
              <a href="#roi" className="b2b-btn-secondary">{t.hero.ctaSecondary}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive CRM Mockup Section ── */}
      <section className="b2b-section alt-bg" id="solutions" style={{ padding: '80px 0' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="b2b-tag">Live Interface Demo</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>See Your Custom Field Dashboard In Action</h2>
            <p style={{ color: 'var(--b2b-text-muted)', maxWidth: '650px', margin: '0 auto' }}>
              We build custom field-operator portals tailored to your workflows. Toggle tabs below to preview the interface.
            </p>
          </div>

          <HVACCrmDemo />
        </div>
      </section>

      {/* ── Pain Points Section ── */}
      <section className="b2b-section" id="problem">
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="b2b-tag" style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#dc2626' }}>The Friction</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{t.pains.title}</h2>
            <p style={{ color: 'var(--b2b-text-muted)', maxWidth: '750px', margin: '0 auto' }}>
              {t.pains.subtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">📄</span>
              <h3>{t.pains.card1.title}</h3>
              <p>{t.pains.card1.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">📞</span>
              <h3>{t.pains.card2.title}</h3>
              <p>{t.pains.card2.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">💰</span>
              <h3>{t.pains.card3.title}</h3>
              <p>{t.pains.card3.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid Solutions Section ── */}
      <section className="b2b-section alt-bg">
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="b2b-tag">The Architecture</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{t.solutions.title}</h2>
            <p style={{ color: 'var(--b2b-text-muted)', maxWidth: '700px', margin: '0 auto' }}>
              {t.solutions.subtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div className="b2b-solution-card">
              <h3>{t.solutions.portal.title}</h3>
              <p>{t.solutions.portal.desc}</p>
            </div>
            <div className="b2b-solution-card">
              <h3>{t.solutions.crm.title}</h3>
              <p>{t.solutions.crm.desc}</p>
            </div>
            <div className="b2b-solution-card">
              <h3>{t.solutions.integrations.title}</h3>
              <p>{t.solutions.integrations.desc}</p>
            </div>
            <div className="b2b-solution-card">
              <h3>{t.solutions.docs.title}</h3>
              <p>{t.solutions.docs.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive ROI Calculator ── */}
      <section className="b2b-section" id="roi">
        <div className="b2b-container">
          <div className="b2b-roi-box">
            <div className="b2b-roi-inputs">
              <span className="b2b-tag" style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#dc2626' }}>Calculations</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#0f172a' }}>{t.roi.title}</h2>
              <p style={{ color: 'var(--b2b-text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
                {t.roi.subtitle}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span>{t.roi.employees}</span>
                    <span>{employees}</span>
                  </div>
                  <input type="range" min="1" max="100" value={employees} onChange={e => setEmployees(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span>{t.roi.hours}</span>
                    <span>{hours}h</span>
                  </div>
                  <input type="range" min="1" max="20" value={hours} onChange={e => setHours(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span>{t.roi.labor}</span>
                    <span>€{labor}/h</span>
                  </div>
                  <input type="range" min="20" max="150" value={labor} onChange={e => setLabor(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="b2b-roi-outputs">
              <span className="label" style={{ color: '#cbd5e1', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.roi.wastedCost}</span>
              <div className="value w-cost" style={{ fontSize: '3rem', fontWeight: 800, margin: '8px 0 24px', color: '#fca5a5' }}>
                €{wastedCost.toLocaleString()}
              </div>

              <span className="label" style={{ color: '#34d399', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{t.roi.savingTitle}</span>
              <div className="value s-cost" style={{ fontSize: '3.6rem', fontWeight: 800, margin: '8px 0 16px', color: '#34d399' }}>
                €{savings.toLocaleString()}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '32px' }}>
                {t.roi.savingSub}
              </p>
              <button onClick={openBooking} className="b2b-roi-cta">{t.roi.cta}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Steps Section ── */}
      <section className="b2b-section alt-bg">
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="b2b-tag">The Deployment</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{t.steps.title}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div className="b2b-step-card">
              <div className="step-num">01</div>
              <h3>{t.steps.step1.title}</h3>
              <p>{t.steps.step1.desc}</p>
            </div>
            <div className="b2b-step-card">
              <div className="step-num">02</div>
              <h3>{t.steps.step2.title}</h3>
              <p>{t.steps.step2.desc}</p>
            </div>
            <div className="b2b-step-card">
              <div className="step-num">03</div>
              <h3>{t.steps.step3.title}</h3>
              <p>{t.steps.step3.desc}</p>
            </div>
            <div className="b2b-step-card">
              <div className="step-num">04</div>
              <h3>{t.steps.step4.title}</h3>
              <p>{t.steps.step4.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="b2b-section" style={{ padding: '140px 0', background: 'radial-gradient(circle at center, #1e1b4b, #030712)' }}>
        <div className="b2b-container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="b2b-tag" style={{ background: '#e11d48', color: 'white', border: 'none' }}>Get Autopilot</span>
          <h2 style={{ fontSize: '2.8rem', color: 'white', marginBottom: '24px', letterSpacing: '-0.02em' }}>{t.cta.title}</h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
            {t.cta.desc}
          </p>
          <button onClick={openBooking} className="b2b-btn-primary" style={{ padding: '18px 36px', fontSize: '1.05rem' }}>{t.cta.button}</button>
        </div>
      </section>
    </div>
  )
}

function HVACCrmDemo() {
  const [theme, setTheme] = useState('indigo') // blue, emerald, indigo
  const [activeTab, setActiveTab] = useState('dispatch') // dispatch, tech_portal, analytics
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [technicians, setTechnicians] = useState([
    { id: '1', name: 'Marco Bos', status: 'On Site', job: 'Heat Pump Repair', zone: 'Amsterdam West' },
    { id: '2', name: 'Sven de Jong', status: 'Travelling', job: 'Annual AC Check', zone: 'Haarlem' },
    { id: '3', name: 'Laura van Veen', status: 'Idle', job: 'None', zone: 'Amsterdam Zuid' },
    { id: '4', name: 'Thijs Bakker', status: 'Completed', job: 'Compressor Install', zone: 'Utrecht' }
  ])

  const [logMessages, setLogMessages] = useState([
    '[10:04:12] Job "AC Maintenance" auto-dispatched to Sven de Jong',
    '[09:58:30] Marco Bos completed work order for Job #8023',
    '[09:57:00] Generated PDF Service Sheet for heatpump_INV-2049 (1.1s)',
    '[09:45:12] Mollie sync webhook parsed: €245 payout processed for Sven',
    '[09:30:00] Customer sign-off uploaded: Marco Bos captured digital signature'
  ])

  const handleDispatchJob = () => {
    if (!searchQuery.trim()) return alert('Please enter a job details/address to dispatch.')
    const newLog = `[${new Date().toLocaleTimeString()}] Dispatched "${searchQuery}" to Laura van Veen`
    setLogMessages(prev => [newLog, ...prev])
    setTechnicians(prev => prev.map(t => t.id === '3' ? { ...t, status: 'Travelling', job: searchQuery } : t))
    setSearchQuery('')
  }

  return (
    <div className={`b2b-mock-crm theme-${theme}`}>
      {/* Chrome Header Bar */}
      <div className="b2b-crm-header">
        <div className="b2b-crm-dots">
          <span className="b2b-crm-dot red"></span>
          <span className="b2b-crm-dot yellow"></span>
          <span className="b2b-crm-dot green"></span>
        </div>
        <div className="b2b-crm-title-bar">
          <span>🔒</span>
          <span>autoflow.studio/field/dispatch</span>
        </div>
        <div className="b2b-crm-theme-selector">
          <span className={`b2b-crm-theme-dot blue ${theme === 'blue' ? 'active' : ''}`} onClick={() => setTheme('blue')} title="Cobalt Blue"></span>
          <span className={`b2b-crm-theme-dot emerald ${theme === 'emerald' ? 'active' : ''}`} onClick={() => setTheme('emerald')} title="Emerald Green"></span>
          <span className={`b2b-crm-theme-dot indigo ${theme === 'indigo' ? 'active' : ''}`} onClick={() => setTheme('indigo')} title="Field Crimson"></span>
        </div>
      </div>

      {/* Body */}
      <div className="b2b-crm-body">
        {/* Sidebar */}
        <div className="b2b-crm-sidebar">
          <button className={`b2b-crm-nav-item ${activeTab === 'dispatch' ? 'active' : ''}`} onClick={() => setActiveTab('dispatch')}>
            <span>📋</span>
            Dispatch Board
          </button>
          <button className={`b2b-crm-nav-item ${activeTab === 'tech_portal' ? 'active' : ''}`} onClick={() => setActiveTab('tech_portal')}>
            <span>📱</span>
            Monteurs Portaal
          </button>
          <button className={`b2b-crm-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <span>📈</span>
            Field Analytics
          </button>
        </div>

        {/* Main Content */}
        <div className="b2b-crm-main">
          {activeTab === 'dispatch' && (
            <div>
              <div className="b2b-crm-stats-grid">
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Active Technicians</span>
                    <span className="growth-tag" style={{ color: '#10b981' }}>4 Online</span>
                  </div>
                  <div className="value-row">
                    <div className="value">4 / 4</div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Today's Jobs</span>
                    <span className="growth-tag" style={{ color: '#fbbf24' }}>Pending</span>
                  </div>
                  <div className="value-row">
                    <div className="value">18</div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Avg. Fix Time</span>
                    <span className="growth-tag">-18.4%</span>
                  </div>
                  <div className="value-row">
                    <div className="value">42 min</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Technician Dispatch Monitor
                  </span>
                  
                  <div className="b2b-crm-table-container">
                    <table className="b2b-crm-table">
                      <thead>
                        <tr>
                          <th>Technician</th>
                          <th>Status</th>
                          <th>Current Job</th>
                          <th>Zone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {technicians.map(t => (
                          <tr key={t.id}>
                            <td><strong>{t.name}</strong></td>
                            <td>
                              <span style={{ 
                                padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                                background: t.status === 'On Site' ? 'rgba(16, 185, 129, 0.1)' : t.status === 'Travelling' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(255,255,255,0.05)',
                                color: t.status === 'On Site' ? '#10b981' : t.status === 'Travelling' ? '#fb923c' : '#94a3b8'
                              }}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ color: '#cbd5e1' }}>{t.job}</td>
                            <td>{t.zone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input 
                      type="text" placeholder="Enter service description & address to dispatch Laura..." 
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--crm-border)', borderRadius: '6px', color: 'white', fontSize: '11px', outline: 'none' }}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleDispatchJob} style={{ padding: '8px 16px', background: 'var(--b2b-primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      Dispatch
                    </button>
                  </div>
                </div>

                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Real-time Operations Log
                  </span>
                  <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--crm-border)', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '9px', color: '#cbd5e1', lineHeight: '1.6', height: '175px', overflowY: 'auto' }}>
                    {logMessages.map((log, i) => (
                      <div key={i}><span style={{ color: 'var(--b2b-primary)' }}>[Log]</span> {log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech_portal' && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '16px' }}>Monteur App Mockup (Mobile optimized)</span>
              
              <div style={{ width: '280px', background: '#0a0a0a', border: '1px solid var(--crm-border)', borderRadius: '24px', padding: '20px', margin: '0 auto', textAlign: 'left', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--crm-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Monteur Portaal</span>
                  <span style={{ color: '#10b981', fontSize: '10px' }}>● Online</span>
                </div>
                
                <span style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assigned Job</span>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--crm-border)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', color: 'white' }}>AC Compressor Fix</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>📍 Spuistraat 104, Amsterdam</span>
                </div>

                <span style={{ fontSize: '8px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Job Tasks</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px', color: '#cbd5e1', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> Replace filter valves
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> Clean compressor fan
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" /> Test pressure gauge
                  </label>
                </div>

                <button style={{ width: '100%', padding: '10px', background: 'var(--b2b-primary)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Submit Digital Workbon
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '12px' }}>Monthly Operational Cost Leak Recaptured</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--crm-border)', borderRadius: '16px', padding: '24px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Revenue Lost (Manual Admin)</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fecdd3', marginTop: '8px' }}>€12,450</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>AutoFlow Savings Generated</span>
                  <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>€10,582</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
