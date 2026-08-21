import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/landing-b2b.css'

const TRANSLATIONS = {
  en: {
    meta: {
      title: "Scale Your Horeca & Hospitality Bookings Without the No-Show Tax | AutoFlow Studio",
      desc: "Stop losing revenue to table no-shows and chaotic staff shifts. We build custom booking engines, automated WhatsApp/SMS reminders, and native POS integrations tailored to your service rules."
    },
    nav: {
      solutions: "Solutions",
      painPoints: "The Problem",
      roi: "ROI Calculator",
      contact: "Get Started"
    },
    hero: {
      eyebrow: "Horeca & Hospitality Automation",
      heading: "Scale Bookings and Operations Without the ",
      headingHighlight: "No-Show Tax",
      desc: "Tired of empty tables, expensive booking portal commissions, and manual schedule coordination? We design and engineer premium custom reservation portals, shift planners, and automated client alerts that run your hospitality business on autopilot.",
      ctaPrimary: "Book an Operations Audit",
      ctaSecondary: "Calculate Your ROI"
    },
    pains: {
      title: "Why Traditional Horeca Scaling Fails",
      subtitle: "The busier you get, the more coordination leaks occur. Paying commissions to third-party booking portals and calling guests to confirm tables eats your profit margins.",
      card1: {
        title: "The Third-Party Commission Tax",
        desc: "External reservation systems charge you per seat or per cover. You end up paying rent on your own repeat local customers."
      },
      card2: {
        title: "Table No-Shows",
        desc: "Without automated, conversational SMS/WhatsApp confirmations, up to 20% of peak-hour bookings turn into empty tables."
      },
      card3: {
        title: "Shift Scheduling Friction",
        desc: "Staff shift coordination logged on spreadsheets or WhatsApp chats leads to double-bookings, missed shifts, and high turnover."
      }
    },
    solutions: {
      title: "Engineered For Hospitality Efficiency",
      subtitle: "We replace manual reservation logs and seat commissions with custom software assets that you own forever. No seat limits, infinite integration freedom.",
      portal: {
        title: "Bespoke Reservation Engines",
        desc: "Give your guests a beautiful web app to reserve tables, request event packages, and pay pre-bookings with zero commission fees."
      },
      crm: {
        title: "Internal Management Systems",
        desc: "Custom back-office boards for floor planning, table occupancy monitoring, guest preference logging, and shifts calendars."
      },
      integrations: {
        title: "POS & SMS Pipelines",
        desc: "Securely link table status changes to trigger automated SMS reminders, feedback surveys, or accounting entries in Exact/Moneybird."
      },
      docs: {
        title: "Automated Staff Planners",
        desc: "Instantly draft, optimize, and dispatch shift schedules based on staff availability, labor rules, and historical peak hours."
      }
    },
    roi: {
      title: "Calculate Your Annual Seat Leak",
      subtitle: "Adjust the sliders below to see how much capital your business is wasting on no-shows and third-party fees every single year.",
      employees: "Average Covers/Week",
      hours: "Average No-Show Rate (%)",
      labor: "Average Bill Per Cover (Euro)",
      wastedCost: "Annual Cost of Lost Seating",
      savingTitle: "Expected Savings With AutoFlow",
      savingSub: "By implementing custom booking alerts and automated text confirmations, you typically recapture 85% of this lost capital.",
      cta: "Recapture This Waste Now"
    },
    steps: {
      title: "The Path to Automated Operations",
      step1: {
        title: "Operational Audit",
        desc: "We analyze your guest journey, shift management, and software commission structures to identify the leakage."
      },
      step2: {
        title: "High-End Blueprint",
        desc: "We design pixel-perfect mockups and interactive reservation flows tailored to your hospitality brand."
      },
      step3: {
        title: "System Engineering",
        desc: "We build secure database tables (Postgres) and incredibly fast, responsive guest reservation portals."
      },
      step4: {
        title: "Autonomous Launch",
        desc: "Your custom booking engine goes live, Twilio/SMS triggers sync, and your seats fill on autopilot."
      }
    },
    cta: {
      title: "Ready to Automate Your Booking System?",
      desc: "Stop paying commissions per guest to reservation giants. Let's design and build a custom system that fits your brand perfectly.",
      button: "Schedule a Discovery Call"
    }
  },
  nl: {
    meta: {
      title: "Schaal je horeca- en hotelreserveringen zonder no-show verliezen | AutoFlow Studio",
      desc: "Stop met het betalen van hoge commissies aan externe boekingssites. Wij bouwen reserveringssystemen en automatische SMS/WhatsApp herinneringen op maat."
    },
    nav: {
      solutions: "Oplossingen",
      painPoints: "Het Probleem",
      roi: "ROI Calculator",
      contact: "Aan de slag"
    },
    hero: {
      eyebrow: "Horeca & Hospitality Automatisering",
      heading: "Schaal reserveringen en operaties zonder de ",
      headingHighlight: "No-Show Belasting",
      desc: "Moe van lege tafels, dure commissies per gast en handmatige planning? Wij ontwerpen en bouwen op maat gemaakte reserveringsportalen, shiftplanners en automatische sms-herinneringen waarmee je horecazaak op autopilot draait.",
      ctaPrimary: "Boek een Operations Audit",
      ctaSecondary: "Bereken je ROI"
    },
    pains: {
      title: "Waarom Traditioneel Opschalen in Horeca Mislukt",
      subtitle: "Hoe drukker je zaak wordt, hoe groter de kans op operationele lekken. Hoge commissies per gast afdragen aan boekingsplatforms vreet aan je marges.",
      card1: {
        title: "Hoge Commissies Per Gast",
        desc: "Externe reserveringssystemen rekenen kosten per stoel. Je betaalt telkens opnieuw commissie voor je eigen, lokale vaste gasten."
      },
      card2: {
        title: "Tafels Die Leeg Blijven (No-Shows)",
        desc: "Zonder automatische WhatsApp/SMS herinneringen blijft tot wel 20% van de reserveringen tijdens piekuren onbezet."
      },
      card3: {
        title: "Planning & Rooster Frictie",
        desc: "Dienstroosters bijhouden in Excel-bladen of WhatsApp-groepen zorgt voor dubbele boekingen, gemiste shifts en hoge personeelswisselingen."
      }
    },
    solutions: {
      title: "Gebouwd Voor Horeca Efficiëntie",
      subtitle: "Wij vervangen handmatige urenstaten en boekingscommissies door op maat gemaakte software-assets die je voor altijd bezit.",
      portal: {
        title: "Op Maat Reserveringssystemen",
        desc: "Geef gasten een prachtig portaal om tafels te reserveren, arrangementen te kiezen en aanbetalingen te doen met 0% commissiekosten."
      },
      crm: {
        title: "Interne Beheersystemen",
        desc: "Dashboards voor tafelbezetting, zaalindeling, bijhouden van gastenvoorkeuren en het eenvoudig inplannen van personeel."
      },
      integrations: {
        title: "Kassa (POS) & SMS Koppelingen",
        desc: "Statuswijzigingen in je kassa triggeren automatisch WhatsApp-herinneringen, feedbackformulieren of Exact/Moneybird boekingen."
      },
      docs: {
        title: "Automatische Dienstroosters",
        desc: "Genereer en verzend direct dienstroosters op basis van de beschikbaarheid van je personeel en de historische piekuren."
      }
    },
    roi: {
      title: "Bereken je Jaarlijkse Stoel Lek",
      subtitle: "Verschuif de regelaars hieronder om te zien hoeveel omzet er jaarlijks verloren gaat aan no-shows en commissies.",
      employees: "Gemiddeld Aantal Gasten/Week",
      hours: "Gemiddeld No-Show Percentage (%)",
      labor: "Gemiddelde Besteding Per Gast",
      wastedCost: "Jaarlijkse Kosten Lege Stoelen",
      savingTitle: "Verwachte Besparing Met AutoFlow",
      savingSub: "Door het invoeren van automatische sms-bevestigingen en herinneringen win je doorgaans 85% van dit verloren kapitaal terug.",
      cta: "Win Deze Verspilling Nu Terug"
    },
    steps: {
      title: "De Route Naar Geautomatiseerde Groei",
      step1: {
        title: "Operationele Audit",
        desc: "We analyseren je reserveringsstromen, commissiekosten en roosterplanning om de grootste lekken te dichten."
      },
      step2: {
        title: "Hoogwaardig Ontwerp",
        desc: "We ontwerpen een pixel-perfecte, conversie-geoptimaliseerde reserveringsflow die past bij jouw merk."
      },
      step3: {
        title: "Systeembouw",
        desc: "We bouwen veilige, supersnelle databases (Postgres) en gebruiksvriendelijke reserveringsportalen."
      },
      step4: {
        title: "Autonome Lancering",
        desc: "Je boekingssysteem gaat live, sms-triggers synchroniseren en je zaak vult zich automatisch."
      }
    },
    cta: {
      title: "Klaar Om Commissievrij te Werken?",
      desc: "Stop met het betalen van provisies per gast aan boekingsgiganten. Laten we jouw perfecte horeca-reserveringssysteem bouwen.",
      button: "Plan je Discovery Call"
    }
  }
}

export default function HorecaAutomation({ lang }) {
  const navigate = useNavigate()
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  // ROI Calculator States
  const [covers, setCovers] = useState(400)
  const [noShowRate, setNoShowRate] = useState(10)
  const [avgBill, setAvgBill] = useState(45)

  const [wastedCost, setWastedCost] = useState(0)
  const [savings, setSavings] = useState(0)

  useEffect(() => {
    // covers * weeks(52) * noShowRate% * avgBill
    const annualWasted = covers * 52 * (noShowRate / 100) * avgBill
    setWastedCost(annualWasted)
    setSavings(Math.round(annualWasted * 0.85))
  }, [covers, noShowRate, avgBill])

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
        detail: { query: 'Horeca & Hospitality Operations Audit request from Standalone Landing Page' }
      })
    )
  }

  const switchLang = (toLang) => {
    if (toLang === 'nl') {
      navigate('/nl/solutions/horeca-hospitality')
    } else {
      navigate('/solutions/horeca-hospitality')
    }
  }

  return (
    <div className="b2b-landing red-landing">
      {/* Standalone Glass Navigation */}
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

      {/* Hero Section */}
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

      {/* Interactive CRM Demo */}
      <section className="b2b-section alt-bg" id="solutions" style={{ padding: '80px 0' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="b2b-tag">Live Interface Demo</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>See Your Booking Engine In Action</h2>
            <p style={{ color: 'var(--b2b-text-muted)', maxWidth: '650px', margin: '0 auto' }}>
              We build custom guest planners and POS status checkers. Toggle tabs below to preview the interface.
            </p>
          </div>

          <HorecaCrmDemo />
        </div>
      </section>

      {/* Pain Points Section */}
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
              <span className="b2b-pain-icon">🎫</span>
              <h3>{t.pains.card1.title}</h3>
              <p>{t.pains.card1.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">⏳</span>
              <h3>{t.pains.card2.title}</h3>
              <p>{t.pains.card2.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">📅</span>
              <h3>{t.pains.card3.title}</h3>
              <p>{t.pains.card3.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Solutions Section */}
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

      {/* Interactive ROI Calculator */}
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
                    <span>{covers} Covers</span>
                  </div>
                  <input type="range" min="50" max="2000" step="50" value={covers} onChange={e => setCovers(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span>{t.roi.hours}</span>
                    <span>{noShowRate}%</span>
                  </div>
                  <input type="range" min="1" max="40" value={noShowRate} onChange={e => setNoShowRate(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span>{t.roi.labor}</span>
                    <span>€{avgBill}/cover</span>
                  </div>
                  <input type="range" min="10" max="150" value={avgBill} onChange={e => setAvgBill(parseInt(e.target.value))} style={{ width: '100%' }} />
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

      {/* Process Steps */}
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

      {/* Final Call to Action */}
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

function HorecaCrmDemo() {
  const [theme, setTheme] = useState('indigo') // blue, emerald, indigo
  const [activeTab, setActiveTab] = useState('reservations') // reservations, shifts, live_monitor
  const [searchQuery, setSearchQuery] = useState('')

  const [tables, setTables] = useState([
    { id: '1', name: 'Table 4 (4 Pax)', status: 'Occupied', guest: 'Lars van de Berg', time: '19:00' },
    { id: '2', name: 'Table 12 (2 Pax)', status: 'Confirmed', guest: 'Sophie Hermans', time: '20:15' },
    { id: '3', name: 'Table 8 (6 Pax)', status: 'No-Show Alert', guest: 'Hendrik Voet', time: '19:30' },
    { id: '4', name: 'Table 2 (2 Pax)', status: 'Idle', guest: 'None', time: '-' }
  ])

  const [logMessages, setLogMessages] = useState([
    '[20:01:00] WhatsApp reminder dispatched to Sophie Hermans (Table 12)',
    '[19:55:12] Auto-cancelled Table 8 booking - Hendrick Voet did not confirm via SMS',
    '[19:50:30] Sent Mollie deposit refund back to Table 3 cancellation (INV-9844)',
    '[19:40:00] Table 4 status updated: Occupied (dispatched main courses alerts)',
    '[19:22:15] Synced reservations database: €450 total covers locked for tonight'
  ])

  const handleBookTable = () => {
    if (!searchQuery.trim()) return alert('Please enter guest name to book Table 2.')
    const newLog = `[${new Date().toLocaleTimeString()}] Reserving Table 2 for ${searchQuery} (2 Pax)`
    setLogMessages(prev => [newLog, ...prev])
    setTables(prev => prev.map(t => t.id === '4' ? { ...t, status: 'Confirmed', guest: searchQuery, time: '20:30' } : t))
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
          <span>autoflow.studio/restaurant/booking</span>
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
          <button className={`b2b-crm-nav-item ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
            <span>🍽️</span>
            Table Planner
          </button>
          <button className={`b2b-crm-nav-item ${activeTab === 'shifts' ? 'active' : ''}`} onClick={() => setActiveTab('shifts')}>
            <span>📅</span>
            Shift Schedules
          </button>
          <button className={`b2b-crm-nav-item ${activeTab === 'live_monitor' ? 'active' : ''}`} onClick={() => setActiveTab('live_monitor')}>
            <span>📈</span>
            Guest Analytics
          </button>
        </div>

        {/* Main Content */}
        <div className="b2b-crm-main">
          {activeTab === 'reservations' && (
            <div>
              <div className="b2b-crm-stats-grid">
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Total Covers Tonight</span>
                    <span className="growth-tag" style={{ color: '#10b981' }}>+8.3%</span>
                  </div>
                  <div className="value-row">
                    <div className="value">84 Guests</div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">No-Shows Avoided</span>
                    <span className="growth-tag" style={{ color: '#10b981' }}>98% Success</span>
                  </div>
                  <div className="value-row">
                    <div className="value">6 Tables</div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">POS Revenue</span>
                    <span className="growth-tag">+12.4%</span>
                  </div>
                  <div className="value-row">
                    <div className="value">€3,780</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Interactive Floor Map & Status
                  </span>
                  
                  <div className="b2b-crm-table-container">
                    <table className="b2b-crm-table">
                      <thead>
                        <tr>
                          <th>Table</th>
                          <th>Status</th>
                          <th>Guest Name</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tables.map(t => (
                          <tr key={t.id}>
                            <td><strong>{t.name}</strong></td>
                            <td>
                              <span style={{ 
                                padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                                background: t.status === 'Occupied' ? 'rgba(16, 185, 129, 0.1)' : t.status === 'Confirmed' ? 'rgba(59, 130, 246, 0.1)' : t.status === 'No-Show Alert' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                color: t.status === 'Occupied' ? '#10b981' : t.status === 'Confirmed' ? '#3b82f6' : t.status === 'No-Show Alert' ? '#f87171' : '#94a3b8'
                              }}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ color: '#cbd5e1' }}>{t.guest}</td>
                            <td>{t.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input 
                      type="text" placeholder="Enter guest name to book Table 2..." 
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--crm-border)', borderRadius: '6px', color: 'white', fontSize: '11px', outline: 'none' }}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleBookTable} style={{ padding: '8px 16px', background: 'var(--b2b-primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      Reserve Table
                    </button>
                  </div>
                </div>

                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Live Guest Communications Log
                  </span>
                  <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--crm-border)', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '9px', color: '#cbd5e1', lineHeight: '1.6', height: '175px', overflowY: 'auto' }}>
                    {logMessages.map((log, i) => (
                      <div key={i}><span style={{ color: 'var(--b2b-primary)' }}>[SMS]</span> {log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shifts' && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '16px' }}>Staff Shift Planner Mockup</span>
              
              <div style={{ width: '320px', background: '#0a0a0a', border: '1px solid var(--crm-border)', borderRadius: '24px', padding: '20px', margin: '0 auto', textAlign: 'left', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--crm-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Friday Evening Shift</span>
                  <span style={{ color: '#10b981', fontSize: '10px' }}>Staffed</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <span>👨‍🍳 Chef de Cuisine</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>Jan de Wit</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <span>🍷 Head Sommelier</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>Emma Klein</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <span>💁 Floor Manager</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>Lucas Bakker</span>
                  </div>
                </div>

                <button style={{ width: '100%', padding: '10px', background: 'var(--b2b-primary)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
                  Publish Shift Schedules
                </button>
              </div>
            </div>
          )}

          {activeTab === 'live_monitor' && (
            <div>
              <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '12px' }}>Peak Seating Costs Recovered</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--crm-border)', borderRadius: '16px', padding: '24px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Revenue Lost (Manual Checkups)</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fecdd3', marginTop: '8px' }}>€8,900</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>AutoFlow Savings Generated</span>
                  <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>€7,565</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
