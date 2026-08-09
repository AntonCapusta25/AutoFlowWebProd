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
        desc: "Verdrinken in status update requests. Clients expect immediate self-service document access and live status progress, not delayed email attachments."
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
    // E * H * C * 52 weeks
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
      <header className="b2b-section">
        <div className="b2b-container b2b-hero-grid">
          <div className="b2b-hero-left">
            <span className="b2b-tag">{t.hero.eyebrow}</span>
            <h1>
              {t.hero.heading}
              <span className="highlight">{t.hero.headingHighlight}</span>
            </h1>
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
          <div className="b2b-hero-right">
            <MockCRM lang={lang} />
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
  const [theme, setTheme] = useState('blue')
  const [activeTab, setActiveTab] = useState('workflows')
  
  // Workflows Tab States
  const [activeNode, setActiveNode] = useState(1)

  // Invoices Tab States
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  
  // Integrations Tab States
  const [integrations, setIntegrations] = useState({
    mollie: true,
    stripe: false,
    slack: true,
    moneybird: false
  })
  const [loadingInt, setLoadingInt] = useState(null)

  const toggleIntegration = (key) => {
    if (loadingInt) return
    setLoadingInt(key)
    setTimeout(() => {
      setIntegrations(prev => ({ ...prev, [key]: !prev[key] }))
      setLoadingInt(null)
    }, 800)
  }

  const invoices = [
    { id: 'INV-042', name: 'Acme Corp', amount: '€1,450', status: 'Paid', date: '08-08-2026' },
    { id: 'INV-043', name: 'TechStart Ltd', amount: '€2,890', status: 'Pending', date: '09-08-2026' },
    { id: 'INV-044', name: 'Milo & Co', amount: '€850', status: 'Paid', date: '07-08-2026' }
  ]

  return (
    <div className={`b2b-mock-crm theme-${theme}`}>
      {/* ── Chrome Header ── */}
      <div className="b2b-crm-header">
        <div className="b2b-crm-dots">
          <span className="b2b-crm-dot red"></span>
          <span className="b2b-crm-dot yellow"></span>
          <span className="b2b-crm-dot green"></span>
        </div>
        <div className="b2b-crm-title-bar">
          <span>🔒</span>
          <span>autoflow-dashboard.net/b2b</span>
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
            title="Royal Indigo"
          ></span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="b2b-crm-body">
        {/* Sidebar */}
        <div className="b2b-crm-sidebar">
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'workflows' ? 'active' : ''}`}
            onClick={() => { setActiveTab('workflows'); setSelectedInvoice(null); }}
          >
            <span>🔄</span>
            Workflows
          </button>
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => { setActiveTab('invoices'); setSelectedInvoice(null); }}
          >
            <span>📄</span>
            {lang === 'nl' ? 'Facturen' : 'Invoices'}
          </button>
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSelectedInvoice(null); }}
          >
            <span>📈</span>
            {lang === 'nl' ? 'Rapporten' : 'Analytics'}
          </button>
          <button 
            className={`b2b-crm-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('integrations'); setSelectedInvoice(null); }}
          >
            <span>🔌</span>
            {lang === 'nl' ? 'Koppelingen' : 'Integrations'}
          </button>
        </div>

        {/* Content Panel */}
        <div className="b2b-crm-main">
          {/* 1. Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="b2b-crm-flow">
              <svg className="b2b-crm-connector">
                <path 
                  className={`b2b-crm-path ${activeNode >= 1 ? 'active' : ''}`}
                  d="M 50,150 H 130" 
                />
                <path 
                  className={`b2b-crm-path ${activeNode >= 2 ? 'active' : ''}`}
                  d="M 155,150 H 240" 
                />
              </svg>
              
              <div 
                className={`b2b-crm-node ${activeNode === 1 ? 'active' : ''}`}
                onClick={() => setActiveNode(1)}
              >
                <span className="b2b-crm-node-icon">📥</span>
                <span className="b2b-crm-node-label">Onboarding</span>
                <span className="b2b-crm-node-status active">Active</span>
              </div>

              <div 
                className={`b2b-crm-node ${activeNode === 2 ? 'active' : ''}`}
                onClick={() => setActiveNode(2)}
              >
                <span className="b2b-crm-node-icon">🔍</span>
                <span className="b2b-crm-node-label">Enrich Data</span>
                <span className="b2b-crm-node-status active">Active</span>
              </div>

              <div 
                className={`b2b-crm-node ${activeNode === 3 ? 'active' : ''}`}
                onClick={() => setActiveNode(3)}
              >
                <span className="b2b-crm-node-icon">🚀</span>
                <span className="b2b-crm-node-label">Sync CRM</span>
                <span className={`b2b-crm-node-status ${activeNode === 3 ? 'active' : 'pending'}`}>
                  {activeNode === 3 ? 'Done' : 'Pending'}
                </span>
              </div>
            </div>
          )}

          {/* 2. Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="b2b-crm-table-container">
              {invoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className={`b2b-crm-row ${selectedInvoice?.id === inv.id ? 'selected' : ''}`}
                  onClick={() => setSelectedInvoice(inv)}
                >
                  <span style={{ fontWeight: 600 }}>{inv.name}</span>
                  <span style={{ color: 'var(--crm-text-muted)' }}>{inv.id}</span>
                  <span className={`b2b-crm-badge ${inv.status.toLowerCase()}`}>
                    {inv.status}
                  </span>
                </div>
              ))}

              {/* Side Drawer Panel */}
              {selectedInvoice && (
                <div className="b2b-crm-drawer">
                  <div className="b2b-crm-drawer-header">
                    <span className="b2b-crm-drawer-title">{selectedInvoice.id}</span>
                    <button 
                      className="b2b-crm-drawer-close"
                      onClick={() => setSelectedInvoice(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="b2b-crm-receipt">
                    <p style={{ fontWeight: 700 }}>AutoFlow Studio BV</p>
                    <p>Date: {selectedInvoice.date}</p>
                    <hr style={{ border: 'none', borderTop: '1px dashed var(--crm-border)', margin: '4px 0' }} />
                    <p>Client: {selectedInvoice.name}</p>
                    <p>Service: Custom Portal Dev</p>
                    <p style={{ fontWeight: 700, fontSize: '10px', marginTop: '4px' }}>Total: {selectedInvoice.amount}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div className="b2b-crm-stats-grid">
                <div className="b2b-crm-stat-card">
                  <span className="label">Efficiency</span>
                  <div className="value">+94.2%</div>
                </div>
                <div className="b2b-crm-stat-card">
                  <span className="label">Automations</span>
                  <div className="value">2,450</div>
                </div>
                <div className="b2b-crm-stat-card">
                  <span className="label">Uptime</span>
                  <div className="value">99.9%</div>
                </div>
              </div>

              {/* Animated SVG Chart */}
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

          {/* 4. Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="b2b-crm-integrations-grid">
              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">💳</span>
                  <div>
                    <span className="b2b-crm-int-name">Mollie</span>
                    <p className="b2b-crm-int-status">
                      {integrations.mollie ? (lang === 'nl' ? 'Gekoppeld' : 'Connected') : (lang === 'nl' ? 'Niet gekoppeld' : 'Disconnected')}
                    </p>
                  </div>
                </div>
                {loadingInt === 'mollie' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={integrations.mollie} 
                      onChange={() => toggleIntegration('mollie')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>

              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">🦅</span>
                  <div>
                    <span className="b2b-crm-int-name">Moneybird</span>
                    <p className="b2b-crm-int-status">
                      {integrations.moneybird ? (lang === 'nl' ? 'Gekoppeld' : 'Connected') : (lang === 'nl' ? 'Niet gekoppeld' : 'Disconnected')}
                    </p>
                  </div>
                </div>
                {loadingInt === 'moneybird' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={integrations.moneybird} 
                      onChange={() => toggleIntegration('moneybird')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>

              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">💬</span>
                  <div>
                    <span className="b2b-crm-int-name">Slack</span>
                    <p className="b2b-crm-int-status">
                      {integrations.slack ? (lang === 'nl' ? 'Gekoppeld' : 'Connected') : (lang === 'nl' ? 'Niet gekoppeld' : 'Disconnected')}
                    </p>
                  </div>
                </div>
                {loadingInt === 'slack' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={integrations.slack} 
                      onChange={() => toggleIntegration('slack')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>

              <div className="b2b-crm-int-card">
                <div className="b2b-crm-int-info">
                  <span className="b2b-crm-int-icon">💳</span>
                  <div>
                    <span className="b2b-crm-int-name">Stripe</span>
                    <p className="b2b-crm-int-status">
                      {integrations.stripe ? (lang === 'nl' ? 'Gekoppeld' : 'Connected') : (lang === 'nl' ? 'Niet gekoppeld' : 'Disconnected')}
                    </p>
                  </div>
                </div>
                {loadingInt === 'stripe' ? (
                  <div className="b2b-crm-spinner"></div>
                ) : (
                  <label className="b2b-crm-switch">
                    <input 
                      type="checkbox" 
                      checked={integrations.stripe} 
                      onChange={() => toggleIntegration('stripe')}
                    />
                    <span className="b2b-crm-slider"></span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

