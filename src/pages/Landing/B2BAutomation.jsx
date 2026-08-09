import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/landing-b2b.css'

const TRANSLATIONS = {
  en: {
    meta: {
      title: "Scale Your B2B Operations Without the Headcount Tax | AutoFlow Studio",
      desc: "Stop wasting billable hours on clunky SaaS tools and manual spreadsheet entries. We build custom client portals, bespoke CRMs, and automated database integrations tailored to your business rules."
    },
    nav: {
      solutions: "Solutions",
      painPoints: "The Problem",
      roi: "ROI Calculator",
      contact: "Get Started"
    },
    hero: {
      eyebrow: "B2B Operation Automation",
      heading: "Scale B2B Operations Without the ",
      headingHighlight: "Headcount Tax",
      desc: "Tired of messy emails, rigid SaaS pricing, and manual copy-pasting between systems? We design and engineer premium custom portals, bespoke internal tools, and secure database integrations that run your business on autopilot.",
      ctaPrimary: "Book an Automation Audit",
      ctaSecondary: "Calculate Your ROI"
    },
    pains: {
      title: "Why Traditional B2B Scaling Fails",
      subtitle: "The more clients you win, the more manual friction your team encounters. Hiring more operators to copy-paste data is a temporary band-aid, not a scaling strategy.",
      card1: {
        title: "The Per-Seat SaaS Tax",
        desc: "Traditional software vendors penalize you for growing. As you add employees and clients, your monthly licensing fees skyrocket for zero added value."
      },
      card2: {
        title: "Spreadsheet Chaos",
        desc: "Your internal CRM doesn't talk to your billing or project trackers, leaving your team to waste hours copy-pasting data between tabs."
      },
      card3: {
        title: "Client Support Friction",
        desc: "Drowning in status update requests. Clients expect immediate self-service document access and live status progress, not delayed email attachments."
      }
    },
    solutions: {
      title: "Engineered For Absolute Efficiency",
      subtitle: "We replace manual workflows with custom software assets that you own forever. No monthly licensing, no seat limits, infinite integration freedom.",
      portal: {
        title: "Custom Client Portals",
        desc: "Give your clients a secure, white-labeled dashboard to upload onboarding files, sign agreements, approve milestones, and pay invoices."
      },
      crm: {
        title: "Bespoke CRM & ERP Systems",
        desc: "Ditch generic databases. We build proprietary back-offices modeled around your exact operational vocabulary, pipelines, and state validation machines."
      },
      integrations: {
        title: "Native API Pipelines",
        desc: "Securely link your payment gateways (Mollie, Stripe), accounting software (Exact, Moneybird), and daily tools without fragile third-party integrations."
      },
      docs: {
        title: "Automated Document Engines",
        desc: "Instantly compile, render, and deliver thousands of beautifully styled PDF quotes, agreements, or analytical reports in single-digit seconds."
      }
    },
    roi: {
      title: "Calculate Your Annual Operational Leak",
      subtitle: "Adjust the sliders below to see how much capital your business is wasting on manual admin tasks every single year.",
      employees: "Number of Employees",
      hours: "Hours Wasted/Employee/Week",
      labor: "Average Internal Hourly Cost",
      wastedCost: "Annual Cost of Manual Work",
      savingTitle: "Expected Savings With AutoFlow",
      savingSub: "By automating document generation, billing workflows, and client portals, you typically recapture 85% of this lost capital.",
      cta: "Recapture This Waste Now"
    },
    steps: {
      title: "The Path to Automated Scaling",
      step1: {
        title: "Operational Audit",
        desc: "We analyze your workflows and identify the quiet time-wasters and manual copy-paste loops."
      },
      step2: {
        title: "High-End Blueprint",
        desc: "We design pixel-perfect mockups and interactive wireframes of your custom tool before writing code."
      },
      step3: {
        title: "API Engineering",
        desc: "We develop secure, decoupled backend databases (Postgres) and blindingly fast frontends (React)."
      },
      step4: {
        title: "Autonomous Launch",
        desc: "Your custom dashboard launches, webhooks sync your tools, and your business runs on autopilot."
      }
    },
    cta: {
      title: "Ready to Own Your Infrastructure?",
      desc: "Stop paying monthly rent on rigid software. Let's design and build a high-performance system that fits your B2B workflows perfectly.",
      button: "Schedule a Discovery Call"
    }
  },
  nl: {
    meta: {
      title: "Schaal je B2B-operatie zonder extra personeelskosten | AutoFlow Studio",
      desc: "Verspil geen kostbare uren meer aan onhandige SaaS-tools en handmatige Excel-invoer. Wij bouwen klantenportalen, CRM's en database-koppelingen op maat."
    },
    nav: {
      solutions: "Oplossingen",
      painPoints: "Het Probleem",
      roi: "ROI Calculator",
      contact: "Aan de slag"
    },
    hero: {
      eyebrow: "B2B Operationele Automatisering",
      heading: "Schaal je B2B-operaties zonder de ",
      headingHighlight: "Personeelstax",
      desc: "Moe van rommelige e-mails, rigide SaaS-tarieven en handmatig knip-en-plakwerk tussen systemen? Wij ontwerpen en bouwen hoogwaardige portalen, CRM-ERP systemen op maat en databasekoppelingen die je bedrijf op autopilot laten draaien.",
      ctaPrimary: "Boek een Automatiserings-audit",
      ctaSecondary: "Bereken je ROI"
    },
    pains: {
      title: "Waarom Traditionele Groei Vastloopt",
      subtitle: "Hoe meer klanten je wint, hoe meer handmatige frictie je team ervaart. Extra personeel aannemen om data over te typen is een pleister, geen strategie.",
      card1: {
        title: "De Licentietax per Gebruiker",
        desc: "Softwareleveranciers straffen je voor groei. Naarmate je team en klantenbestand groeien, stijgen je maandelijkse kosten zonder extra waarde."
      },
      card2: {
        title: "Spreadsheet Chaos",
        desc: "Je interne systemen communiceren niet met je facturatie of projectboards, waardoor je team uren kwijt is aan handmatige imports."
      },
      card3: {
        title: "Frictie in Klantcommunicatie",
        desc: "Verdrinken in e-mails met de vraag 'Wat is de status?'. B2B-klanten verwachten directe self-service toegang tot bestanden en updates."
      }
    },
    solutions: {
      title: "Gebouwd voor Maximale Efficiëntie",
      subtitle: "Wij vervangen handmatige overdrachten door maatwerk software-assets die je voor 100% bezit. Geen seat-licenties, geen limieten, oneindig flexibel.",
      portal: {
        title: "Klantenportalen op Maat",
        desc: "Geef B2B-klanten een beveiligd portaal in je eigen huisstijl om bestanden te uploaden, milestones goed te keuren en facturen te betalen."
      },
      crm: {
        title: "Bespoke CRM & ERP Systemen",
        desc: "Geen generieke velden. Wij bouwen een eigen back-office die exact aansluit op je operationele processen en workflows."
      },
      integrations: {
        title: "Native API Koppelingen",
        desc: "Koppel je betalingsproviders (Mollie, Stripe), boekhouding (Exact Online, Moneybird) en dagelijkse tools via veilige APIs zonder extra plugins."
      },
      docs: {
        title: "Serverless Documenten-Generators",
        desc: "Genereer en lever automatisch duizenden prachtig opgemaakte PDF-offertes, transportovereenkomsten of contracten in enkele seconden."
      }
    },
    roi: {
      title: "Bereken je Jaarlijkse Operationele Lek",
      subtitle: "Verschuif de regelaars om te zien hoeveel kapitaal er jaarlijks binnen je B2B-organisatie weglekt door handmatige administratieve handelingen.",
      employees: "Aantal Medewerkers",
      hours: "Uren Verspild/Medewerker/Week",
      labor: "Gemiddeld Intern Uurtarief",
      wastedCost: "Jaarlijkse Kosten Handmatig Werk",
      savingTitle: "Verwachte Besparing via AutoFlow",
      savingSub: "Door documenten, facturatie en klantenportalen te automatiseren bespaar je gemiddeld 85% van dit weglekkende kapitaal.",
      cta: "Dicht Dit Operationele Lek"
    },
    steps: {
      title: "De Route Naar Optimaal Schalen",
      step1: {
        title: "Operationele Audit",
        desc: "We brengen je processen in kaart en identificeren de grootste tijdverspillers en handmatige handelingen."
      },
      step2: {
        title: "Hoogwaardig Ontwerp",
        desc: "We ontwerpen wireframes en interactieve mockups in je eigen stijl voordat we ook maar één regel code schrijven."
      },
      step3: {
        title: "API & Frontend Engineering",
        desc: "We bouwen een veilige, razendsnelle database (Postgres) en een intuïtieve gebruikersinterface (React)."
      },
      step4: {
        title: "Autonome Lancering",
        desc: "Je systeem gaat live, datakoppelingen draaien op de achtergrond en je processen lopen voortaan op rolletjes."
      }
    },
    cta: {
      title: "Klaar Om Je Eigen Infrastructuur te Bezitten?",
      desc: "Stop met het betalen van maandelijkse huur voor software die niet past. Laten we een systeem ontwerpen dat perfect aansluit op je B2B-organisatie.",
      button: "Plan je Discovery Call"
    }
  }
}

export default function B2BAutomation({ lang }) {
  const navigate = useNavigate()
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  // ROI Calculator States
  const [employees, setEmployees] = useState(15)
  const [hours, setHours] = useState(6)
  const [labor, setLabor] = useState(45)

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
        detail: { query: 'B2B Operations Audit request from Standalone Landing Page' }
      })
    )
  }

  const switchLang = (toLang) => {
    if (toLang === 'nl') {
      navigate('/nl/solutions/b2b-automation')
    } else {
      navigate('/solutions/b2b-automation')
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-US', {
      maximumFractionDigits: 0
    }).format(val)
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="b2b-landing">
      {/* ── Standalone Navigation ── */}
      <nav className="b2b-nav">
        <div className="b2b-nav-logo">
          <Link to={lang === 'nl' ? '/nl' : '/'} aria-label="AutoFlow Studio Home">
            <img src="/images/logo.webp" alt="AutoFlow Studio Logo" />
          </Link>
        </div>

        <ul className="b2b-nav-links">
          <li>
            <a href="#problems" onClick={(e) => { e.preventDefault(); scrollToSection('problems'); }}>
              {t.nav.painPoints}
            </a>
          </li>
          <li>
            <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToSection('solutions'); }}>
              {t.nav.solutions}
            </a>
          </li>
          <li>
            <a href="#roi" onClick={(e) => { e.preventDefault(); scrollToSection('roi'); }}>
              {t.nav.roi}
            </a>
          </li>
        </ul>

        <div className="b2b-nav-right">
          <div className="b2b-lang-switch">
            <button
              className={`b2b-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => switchLang('en')}
            >
              EN
            </button>
            <button
              className={`b2b-lang-btn ${lang === 'nl' ? 'active' : ''}`}
              onClick={() => switchLang('nl')}
            >
              NL
            </button>
          </div>
          <button className="b2b-btn-primary desktop-only" onClick={openBooking}>
            {t.nav.contact}
            <span className="b2b-btn-icon-wrapper">↗</span>
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="b2b-section" style={{ paddingBottom: '0' }}>
        <div className="b2b-container b2b-hero-grid">
          <div className="b2b-hero-left">
            <span className="b2b-tag">{t.hero.eyebrow}</span>
            {lang === 'nl' ? (
              <h1>
                Schaal B2B-operaties <span className="fancy-serif">zonder de</span> <br />
                <span className="highlight">personeelstax</span> <span className="fancy-handwriting">automatisch</span>
              </h1>
            ) : (
              <h1>
                Scale B2B Operations <span className="fancy-serif">without the</span> <br />
                <span className="highlight">headcount tax</span> <span className="fancy-handwriting">on autopilot</span>
              </h1>
            )}
            <p>{t.hero.desc}</p>
            <div className="b2b-hero-actions">
              <button className="b2b-btn-primary" onClick={openBooking}>
                {t.hero.ctaPrimary}
                <span className="b2b-btn-icon-wrapper">↗</span>
              </button>
              <button 
                className="b2b-btn-secondary" 
                onClick={() => scrollToSection('roi')}
              >
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>
        </div>

        {/* ── Centered Interactive Demo Section ── */}
        <div className="b2b-hero-demo">
          <div className="b2b-double-bezel">
            <div className="b2b-bezel-inner">
              <MockCRM lang={lang} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Pain Points Section ── */}
      <section id="problems" className="b2b-section alt-bg">
        <div className="b2b-container">
          <div className="b2b-section-header">
            <span className="b2b-tag">{lang === 'nl' ? 'Knelpunten' : 'Bottlenecks'}</span>
            <h2>{t.pains.title}</h2>
            <p>{t.pains.subtitle}</p>
          </div>

          <div className="b2b-pain-grid">
            <div className="b2b-pain-card">
              <div className="icon-box">€</div>
              <h3>{t.pains.card1.title}</h3>
              <p>{t.pains.card1.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <div className="icon-box">📊</div>
              <h3>{t.pains.card2.title}</h3>
              <p>{t.pains.card2.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <div className="icon-box">✉️</div>
              <h3>{t.pains.card3.title}</h3>
              <p>{t.pains.card3.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Solutions Section ── */}
      <section id="solutions" className="b2b-section">
        <div className="b2b-container">
          <div className="b2b-section-header">
            <span className="b2b-tag">{lang === 'nl' ? 'De Oplossing' : 'Capabilities'}</span>
            <h2>{t.solutions.title}</h2>
            <p>{t.solutions.subtitle}</p>
          </div>

          <div className="b2b-bento-grid">
            <div className="b2b-bento-card col-8">
              <div>
                <div className="icon-wrapper">💻</div>
                <h3>{t.solutions.portal.title}</h3>
                <p>{t.solutions.portal.desc}</p>
              </div>
              <div className="b2b-bento-visual">
                {lang === 'nl' ? '// Beveiligd klantenportaal geactiveerd op portal.jouwdomein.nl' : '// Secure client portal active at portal.yourdomain.com'}
                <br />
                {`{ status: "Authenticated", row_level_security: "Active", data_segregation: "Verified" }`}
              </div>
            </div>

            <div className="b2b-bento-card col-4">
              <div>
                <div className="icon-wrapper">⚙️</div>
                <h3>{t.solutions.crm.title}</h3>
                <p>{t.solutions.crm.desc}</p>
              </div>
            </div>

            <div className="b2b-bento-card col-4">
              <div>
                <div className="icon-wrapper">🔌</div>
                <h3>{t.solutions.integrations.title}</h3>
                <p>{t.solutions.integrations.desc}</p>
              </div>
            </div>

            <div className="b2b-bento-card col-8">
              <div>
                <div className="icon-wrapper">📄</div>
                <h3>{t.solutions.docs.title}</h3>
                <p>{t.solutions.docs.desc}</p>
              </div>
              <div className="b2b-bento-visual">
                {`$ node serverless/pdf-generator.js --template="quote_v2"
[Success] Generated invoice_INV-2026-904.pdf (rendered in 1.4 seconds, delivered via Stripe API)`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROI Calculator Section ── */}
      <section id="roi" className="b2b-section alt-bg">
        <div className="b2b-container">
          <div className="b2b-section-header">
            <span className="b2b-tag">{lang === 'nl' ? 'Rendement' : 'Business Value'}</span>
            <h2>{t.roi.title}</h2>
            <p>{t.roi.subtitle}</p>
          </div>

          <div className="b2b-roi-layout">
            <div className="b2b-roi-controls">
              <div className="b2b-roi-slider-group">
                <div className="b2b-roi-slider-header">
                  <label>{t.roi.employees}</label>
                  <span className="b2b-roi-slider-value">{employees}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="150" 
                  value={employees} 
                  onChange={(e) => setEmployees(parseInt(e.target.value))} 
                />
              </div>

              <div className="b2b-roi-slider-group">
                <div className="b2b-roi-slider-header">
                  <label>{t.roi.hours}</label>
                  <span className="b2b-roi-slider-value">{hours}h</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={hours} 
                  onChange={(e) => setHours(parseInt(e.target.value))} 
                />
              </div>

              <div className="b2b-roi-slider-group">
                <div className="b2b-roi-slider-header">
                  <label>{t.roi.labor}</label>
                  <span className="b2b-roi-slider-value">€{labor}/h</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={labor} 
                  onChange={(e) => setLabor(parseInt(e.target.value))} 
                />
              </div>
            </div>

            <div className="b2b-roi-results">
              <span className="b2b-roi-title">{t.roi.wastedCost}</span>
              <div className="b2b-roi-big-value">
                <span className="currency">€</span>
                {formatCurrency(wastedCost)}
              </div>
              <p className="b2b-roi-subtext">{lang === 'nl' ? 'per jaar verspild aan repeterend handmatig werk' : 'wasted annually on repetitive manual tasks'}</p>
              
              <span className="b2b-roi-title" style={{ color: 'var(--b2b-primary)' }}>{t.roi.savingTitle}</span>
              <div className="b2b-roi-big-value" style={{ color: 'var(--b2b-primary)', fontSize: '56px' }}>
                <span className="currency">€</span>
                {formatCurrency(savings)}
              </div>
              <p className="b2b-roi-subtext" style={{ marginBottom: '40px' }}>{t.roi.savingSub}</p>

              <button className="b2b-btn-primary" onClick={openBooking}>
                {t.roi.cta}
                <span className="b2b-btn-icon-wrapper">↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Timeline ── */}
      <section className="b2b-section">
        <div className="b2b-container">
          <div className="b2b-section-header">
            <span className="b2b-tag">{lang === 'nl' ? 'Het Proces' : 'Delivery Workflow'}</span>
            <h2>{t.steps.title}</h2>
          </div>

          <div className="b2b-steps-grid">
            <div className="b2b-step-card">
              <div className="b2b-step-number">1</div>
              <h3>{t.steps.step1.title}</h3>
              <p>{t.steps.step1.desc}</p>
            </div>
            <div className="b2b-step-card">
              <div className="b2b-step-number">2</div>
              <h3>{t.steps.step2.title}</h3>
              <p>{t.steps.step2.desc}</p>
            </div>
            <div className="b2b-step-card">
              <div className="b2b-step-number">3</div>
              <h3>{t.steps.step3.title}</h3>
              <p>{t.steps.step3.desc}</p>
            </div>
            <div className="b2b-step-card">
              <div className="b2b-step-number">4</div>
              <h3>{t.steps.step4.title}</h3>
              <p>{t.steps.step4.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action Card ── */}
      <section className="b2b-section" style={{ paddingTop: '0' }}>
        <div className="b2b-container">
          <div className="b2b-cta-card">
            <h2>{t.cta.title}</h2>
            <p>{t.cta.desc}</p>
            <button className="b2b-btn-primary" onClick={openBooking}>
              {t.cta.button}
              <span className="b2b-btn-icon-wrapper">↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Standalone Footer ── */}
      <footer className="b2b-footer">
        <div className="b2b-container b2b-footer-content">
          <div className="b2b-footer-logo">
            <img src="/images/logo.webp" alt="AutoFlow Studio" />
          </div>
          <ul className="b2b-footer-links">
            <li><Link to={lang === 'nl' ? '/nl' : '/'}>Home</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/cookie-policy">Cookie Policy</Link></li>
          </ul>
          <p style={{ fontSize: '13px' }}>
            &copy; {new Date().getFullYear()} AutoFlow Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function MockCRM({ lang }) {
  const [theme, setTheme] = useState('indigo')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Leads Bank Simulated Data
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Simulated Lead Takeover Statuses
  const [takeoverStates, setTakeoverStates] = useState({
    'lead-1': 'AI Chatting',
    'lead-2': 'Needs Human',
    'lead-3': 'Handled'
  })

  // Email outreach campaign checklist
  const [campaigns, setCampaigns] = useState({
    mollieRetail: true,
    exactConsultants: false,
    moneybirdService: true
  })

  const [loadingInt, setLoadingInt] = useState(null)

  const toggleCampaign = (key) => {
    if (loadingInt) return
    setLoadingInt(key)
    setTimeout(() => {
      setCampaigns(prev => ({ ...prev, [key]: !prev[key] }))
      setLoadingInt(null)
    }, 600)
  }

  const triggerTakeover = (leadId) => {
    setTakeoverStates(prev => ({ ...prev, [leadId]: 'Taking Over...' }))
    setTimeout(() => {
      setTakeoverStates(prev => ({ ...prev, [leadId]: 'Human Active' }))
    }, 800)
  }

  const leads = [
    { 
      id: 'lead-1', 
      name: 'Walid G. (Retail Corp)', 
      email: 'walid@retailcorp.nl', 
      source: 'Booking Form',
      score: '98%',
      date: 'Today, 18:12',
      chat: [
        { sender: 'visitor', text: 'Hey, do you integrate with Moneybird and Mollie automatically?' },
        { sender: 'bot', text: 'Yes! We construct custom API pipelines for Mollie payments and automate billing synchronization directly to Moneybird ledger accounts. Would you like to check out a live demo?' },
        { sender: 'visitor', text: 'Awesome. I just booked an audit session for next Tuesday.' }
      ]
    },
    { 
      id: 'lead-2', 
      name: 'Jane Smith (LegalNL)', 
      email: 'jsmith@legalnl.nl', 
      source: 'Contact Form',
      score: '84%',
      date: 'Today, 17:34',
      chat: [
        { sender: 'visitor', text: 'Do you offer custom document generation software for transport agreements?' },
        { sender: 'bot', text: 'Absolutely. We design serverless HTML-to-PDF generators processing up to thousands of agreements in seconds. Let me transfer you to an operator for customized pricing...' }
      ]
    },
    { 
      id: 'lead-3', 
      name: 'Mark De Jong (DutchTech)', 
      email: 'm.dejong@dutchtech.io', 
      source: 'Newsletter',
      score: '72%',
      date: 'Yesterday',
      chat: [
        { sender: 'visitor', text: 'Subscribed to your scaling newsletter!' },
        { sender: 'bot', text: 'Welcome! We dispatch weekly operational automation blueprints every Friday.' }
      ]
    }
  ]

  return (
    <div className={`b2b-mock-crm theme-${theme}`}>
      {/* ── Chrome Header Bar ── */}
      <div className="b2b-crm-header">
        <div className="b2b-crm-dots">
          <span className="b2b-crm-dot red"></span>
          <span className="b2b-crm-dot yellow"></span>
          <span className="b2b-crm-dot green"></span>
        </div>
        <div className="b2b-crm-title-bar">
          <span>🔒</span>
          <span>autoflow.studio/admin/dashboard</span>
        </div>
        <div className="b2b-crm-theme-selector">
          <span 
            className={`b2b-crm-theme-dot blue ${theme === 'blue' ? 'active' : ''}`}
            onClick={() => setTheme('blue')}
            title="Cobalt Blue"
          ></span>
          <span 
            className={`b2b-crm-theme-dot emerald ${theme === 'emerald' ? 'active' : ''}`}
            onClick={() => setTheme('emerald')}
            title="Emerald Green"
          ></span>
          <span 
            className={`b2b-crm-theme-dot indigo ${theme === 'indigo' ? 'active' : ''}`}
            onClick={() => setTheme('indigo')}
            title="AutoFlow Purple"
          ></span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="b2b-crm-body">
        {/* Sidebar Navigation */}
        <div className="b2b-crm-sidebar">
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedLead(null); }}
          >
            <span>📊</span>
            Dashboard
          </button>
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('leads'); setSelectedLead(null); }}
          >
            <span>👥</span>
            Leads Bank
          </button>
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => { setActiveTab('campaigns'); setSelectedLead(null); }}
          >
            <span>✉️</span>
            Campaigns
          </button>
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSelectedLead(null); }}
          >
            <span>📈</span>
            Outreach Stats
          </button>
        </div>

        {/* Content Panel */}
        <div className="b2b-crm-main">
          {/* 1. Dashboard View */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="b2b-crm-stats-grid">
                <div className="b2b-crm-stat-card">
                  <span className="label">Total Leads</span>
                  <div className="value" style={{ color: 'var(--crm-accent)' }}>154</div>
                </div>
                <div className="b2b-crm-stat-card">
                  <span className="label">Needs Takeover</span>
                  <div className="value" style={{ color: '#fbbf24' }}>2</div>
                </div>
                <div className="b2b-crm-stat-card">
                  <span className="label">Conversion Rate</span>
                  <div className="value" style={{ color: '#34d399' }}>12.8%</div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Live System Logs (Real-time events)
                </span>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--crm-border)', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '9.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <div><span style={{ color: 'var(--crm-accent)' }}>[18:40:02]</span> Lead "Walid G." status changed to <span style={{ color: '#34d399' }}>needs_takeover</span></div>
                  <div><span style={{ color: 'var(--crm-accent)' }}>[18:35:10]</span> Dispatched PWA Push notification to admin user browser</div>
                  <div><span style={{ color: 'var(--crm-accent)' }}>[18:12:00]</span> Generated serverless document proposal_INV-2026.pdf (1.2s)</div>
                  <div><span style={{ color: 'var(--crm-accent)' }}>[18:05:45]</span> Automated sync completed: Mollie payout synced to Moneybird ledger</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Leads Bank View */}
          {activeTab === 'leads' && (
            <div className="b2b-crm-table-container">
              {leads.map((lead) => (
                <div 
                  key={lead.id} 
                  className={`b2b-crm-row ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <span style={{ fontWeight: 600 }}>{lead.name}</span>
                  <span style={{ color: 'var(--crm-text-muted)' }}>{lead.source}</span>
                  <span className={`b2b-crm-badge ${takeoverStates[lead.id] === 'Human Active' ? 'paid' : 'pending'}`}>
                    {takeoverStates[lead.id]}
                  </span>
                </div>
              ))}

              {/* Side Drawer Lead details sheet */}
              {selectedLead && (
                <div className="b2b-crm-drawer" style={{ width: '230px' }}>
                  <div className="b2b-crm-drawer-header">
                    <span className="b2b-crm-drawer-title">{selectedLead.name}</span>
                    <button className="b2b-crm-drawer-close" onClick={() => setSelectedLead(null)}>✕</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
                    <div style={{ color: 'var(--crm-text-muted)' }}>Conversion Score: <strong style={{ color: 'var(--crm-accent)' }}>{selectedLead.score}</strong></div>
                    <div style={{ color: 'var(--crm-text-muted)' }}>Time: {selectedLead.date}</div>
                    
                    {/* Simulated Chat Transcript */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--crm-border)', borderRadius: '8px', padding: '10px', height: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                      {selectedLead.chat.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'visitor' ? 'flex-start' : 'flex-end' }}>
                          <span style={{ fontSize: '8px', color: 'var(--crm-text-muted)', marginBottom: '2px' }}>
                            {msg.sender === 'visitor' ? 'Visitor' : 'AI Assistant'}
                          </span>
                          <span style={{ 
                            background: msg.sender === 'visitor' ? 'rgba(255,255,255,0.08)' : 'var(--crm-accent-light)',
                            color: msg.sender === 'visitor' ? '#cbd5e1' : 'var(--crm-accent)',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            lineHeight: '1.3',
                            fontSize: '9px',
                            maxWidth: '90%'
                          }}>
                            {msg.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="b2b-btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '10px', marginTop: '6px', width: '100%', justifyContent: 'center' }}
                      onClick={() => triggerTakeover(selectedLead.id)}
                    >
                      {takeoverStates[selectedLead.id] === 'Human Active' ? 'Connected' : 'Take Over Chat'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Email Campaigns View */}
          {activeTab === 'campaigns' && (
            <div className="b2b-crm-integrations-grid">
              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">🎯</span>
                  <div>
                    <span className="b2b-crm-int-name">Q3 Retail Automation</span>
                    <p className="b2b-crm-int-status">Active Outreach</p>
                  </div>
                </div>
                {loadingInt === 'mollieRetail' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={campaigns.mollieRetail} 
                      onChange={() => toggleCampaign('mollieRetail')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>

              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">💼</span>
                  <div>
                    <span className="b2b-crm-int-name">Consultants Outreach</span>
                    <p className="b2b-crm-int-status">Inactive</p>
                  </div>
                </div>
                {loadingInt === 'exactConsultants' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={campaigns.exactConsultants} 
                      onChange={() => toggleCampaign('exactConsultants')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>

              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">⚡</span>
                  <div>
                    <span className="b2b-crm-int-name">Moneybird Service Segment</span>
                    <p className="b2b-crm-int-status">Active Outreach</p>
                  </div>
                </div>
                {loadingInt === 'moneybirdService' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={campaigns.moneybirdService} 
                      onChange={() => toggleCampaign('moneybirdService')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* 4. Outreach Stats View */}
          {activeTab === 'analytics' && (
            <div>
              <div className="b2b-crm-stats-grid">
                <div className="b2b-crm-stat-card">
                  <span className="label">Outreach Sent</span>
                  <div className="value">3,420</div>
                </div>
                <div className="b2b-crm-stat-card">
                  <span className="label">Delivered Rate</span>
                  <div className="value">99.8%</div>
                </div>
                <div className="b2b-crm-stat-card">
                  <span className="label">Open Rate</span>
                  <div className="value">76.4%</div>
                </div>
              </div>

              <svg viewBox="0 0 340 100" style={{ width: '100%', height: '80px', display: 'block' }}>
                <path
                  className="b2b-crm-chart-path"
                  d="M0,80 Q30,40 60,60 T120,30 T180,50 T240,20 T300,40 T340,10"
                  fill="none"
                  stroke="var(--crm-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
