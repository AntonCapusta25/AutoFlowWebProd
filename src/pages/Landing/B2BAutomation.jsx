import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/landing-b2b.css'
import Navbar from '../../components/Navbar'
import SolutionHero from '../../components/SolutionHero'

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

  const employeesPercent = ((employees - 5) / (150 - 5)) * 100
  const hoursPercent = ((hours - 1) / (20 - 1)) * 100
  const laborPercent = ((labor - 20) / (120 - 20)) * 100

  useEffect(() => {
    document.title = t.meta.title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', t.meta.desc)
    }
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      favicon.setAttribute('href', '/images/logo_blue.png')
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
      {/* Standardized Navbar */}
      <Navbar />

      {/* Hero Section featuring 0831 (2).mov Red Video Loop & Interactive Typewriter */}
      <SolutionHero
        lang={lang}
        eyebrow={lang === 'nl' ? '01 / B2B OPERATIES' : '01 / B2B OPERATIONS'}
        headlinePrefix={lang === 'nl' ? 'SCHAAL B2B OPERATIES' : 'SCALE B2B OPERATIONS'}
        headlineHighlight={lang === 'nl' ? 'ZONDER PERSONEELSTAX' : 'WITHOUT HEADCOUNT TAX'}
        subText={t.hero.desc}
        ctaText={t.hero.ctaPrimary}
        ctaSecondaryText={t.hero.ctaSecondary}
        typewriterItems={lang === 'nl' ? [
          'facturen en herinneringen automatisch versturen...',
          'data synchroniseren tussen CRM & boekhouding...',
          'elke lead direct kwalificeren via AI...',
          'handmatig knippen en plakken uitsluiten...'
        ] : [
          'sending invoices and payment reminders...',
          'syncing data between CRM & ERP systems...',
          'qualifying B2B leads instantly with AI...',
          'eliminating manual copy-pasting forever...'
        ]}
        onOpenBooking={(query) => openBooking(query)}
      />

        {/* ── Centered Interactive Demo Section ── */}
        <div className="b2b-hero-demo" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
          <div className="b2b-double-bezel">
            <div className="b2b-bezel-inner">
              <MockCRM lang={lang} />
            </div>
          </div>
        </div>

      {/* ── Partners & APIs Strip ── */}
      <PartnersStrip lang={lang} darkBg={false} />

      {/* ── Pain Points Section ── */}
      <section id="problems" className="b2b-section alt-bg">
        <div className="b2b-container">
          <div className="b2b-section-header">
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
      <section id="roi" className="b2b-section">
        <div className="calc-container">
          <div className="calc-header">
            <h2 className="calc-title">{t.roi.title}</h2>
          </div>

          <div className="calc-grid">
            {/* Left Column: Configuration */}
            <div className="calc-card">
              <h3 className="calc-card-title">{lang === 'nl' ? 'Configureer je organisatie' : 'Configure your organization'}</h3>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.employees}</label>
                  <span className="value">{employees}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="150" 
                  step="1"
                  value={employees} 
                  onChange={e => setEmployees(parseInt(e.target.value))} 
                  className="calc-slider"
                  style={{
                    background: `linear-gradient(to right, var(--b2b-primary) 0%, var(--b2b-primary) ${employeesPercent}%, #cbd5e1 ${employeesPercent}%, #cbd5e1 100%)`
                  }}
                />
                <div className="calc-slider-footer">
                  <span>5</span>
                  <span>150</span>
                </div>
              </div>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.hours}</label>
                  <span className="value">{hours}h</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="1"
                  value={hours} 
                  onChange={e => setHours(parseInt(e.target.value))} 
                  className="calc-slider"
                  style={{
                    background: `linear-gradient(to right, var(--b2b-primary) 0%, var(--b2b-primary) ${hoursPercent}%, #cbd5e1 ${hoursPercent}%, #cbd5e1 100%)`
                  }}
                />
                <div className="calc-slider-footer">
                  <span>1h</span>
                  <span>20h / week</span>
                </div>
              </div>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.labor}</label>
                  <span className="value">€{labor}/h</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={labor} 
                  onChange={e => setLabor(parseInt(e.target.value))} 
                  className="calc-slider"
                  style={{
                    background: `linear-gradient(to right, var(--b2b-primary) 0%, var(--b2b-primary) ${laborPercent}%, #cbd5e1 ${laborPercent}%, #cbd5e1 100%)`
                  }}
                />
                <div className="calc-slider-footer">
                  <span>€20/h</span>
                  <span>€120/h</span>
                </div>
              </div>

              <div className="calc-info-note">
                <p>{t.roi.savingSub}</p>
              </div>
            </div>

            {/* Right Column: Savings & Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Card */}
              <div className="calc-summary-card">
                <p className="label">{t.roi.savingTitle}</p>
                <div className="calc-summary-value">€{savings.toLocaleString()}</div>
                <p className="calc-summary-sub">{lang === 'nl' ? 'per jaar · 85% besparing op handmatig werk' : 'per year · 85% savings on manual tasks'}</p>
                <div className="calc-divider"></div>
                <div className="calc-submetrics">
                  <div>
                    <p className="calc-submetric-label">{lang === 'nl' ? 'Per maand' : 'Per month'}</p>
                    <p className="calc-submetric-value">€{Math.round(savings / 12).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="calc-submetric-label">{lang === 'nl' ? 'Over 5 jaar' : 'Over 5 years'}</p>
                    <p className="calc-submetric-value">€{(savings * 5).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Breakdown Card */}
              <div className="calc-breakdown-card">
                <h4 className="calc-breakdown-title">{lang === 'nl' ? 'Jaarlijks kostenoverzicht' : 'Annual cost breakdown'}</h4>
                <div className="calc-progress-group">
                  <div className="calc-progress-header">
                    <span className="calc-progress-label">{t.roi.wastedCost}</span>
                    <span className="calc-progress-value">€{wastedCost.toLocaleString()}</span>
                  </div>
                  <div className="calc-progress-bar-bg">
                    <div className="calc-progress-bar" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="calc-progress-group">
                  <div className="calc-progress-header">
                    <span className="calc-progress-label">{lang === 'nl' ? 'Kosten met AutoFlow' : 'Cost with AutoFlow'}</span>
                    <span className="calc-progress-value highlight">€{Math.round(wastedCost - savings).toLocaleString()}</span>
                  </div>
                  <div className="calc-progress-bar-bg">
                    <div 
                      className="calc-progress-bar highlight" 
                      style={{ 
                        width: `${wastedCost > 0 ? Math.round(((wastedCost - savings) / wastedCost) * 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="calc-btn-container">
                  <button className="calc-cta-btn" onClick={openBooking}>
                    {t.roi.cta} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Timeline ── */}
      <section className="b2b-section">
        <div className="b2b-container">
          <div className="b2b-section-header">
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
            <img src="/images/logo_blue.png" alt="AutoFlow Studio" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Leads Bank Simulated Data
  const [selectedLead, setSelectedLead] = useState(null)
  
  // Simulated Lead Takeover Statuses
  const [takeoverStates, setTakeoverStates] = useState({
    'lead-1': 'needs_human',
    'lead-2': 'bot_chatting',
    'lead-3': 'converted',
    'lead-4': 'needs_human',
    'lead-5': 'human_active',
    'lead-6': 'bot_chatting',
    'lead-7': 'converted',
    'lead-8': 'bot_chatting'
  })

  // Email outreach campaign checklist
  const [campaigns, setCampaigns] = useState([
    { id: 'camp-1', name: 'Q3 Retail Outreach Segment', status: 'Running', sent: 1420, open: '76.4%', reply: '18.2%', active: true },
    { id: 'camp-2', name: 'Mollie API Integrations Pitch', status: 'Running', sent: 1150, open: '81.0%', reply: '22.8%', active: true },
    { id: 'camp-3', name: 'Bespoke CRM Catch-up', status: 'Paused', sent: 850, open: '68.5%', reply: '12.4%', active: false },
    { id: 'camp-4', name: 'SME Logistics Cold Reach', status: 'Completed', sent: 3200, open: '64.2%', reply: '9.6%', active: true }
  ])

  const [loadingInt, setLoadingInt] = useState(null)

  const toggleCampaign = (id) => {
    if (loadingInt) return
    setLoadingInt(id)
    setTimeout(() => {
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !c.active, status: c.active ? 'Paused' : 'Running' } : c))
      setLoadingInt(null)
    }, 500)
  }

  const triggerTakeover = (leadId) => {
    setTakeoverStates(prev => ({ ...prev, [leadId]: 'taking_over' }))
    setTimeout(() => {
      setTakeoverStates(prev => ({ ...prev, [leadId]: 'human_active' }))
    }, 700)
  }

  const leads = [
    { 
      id: 'lead-1', 
      name: 'Walid G. (Retail Corp)', 
      email: 'walid@retailcorp.nl', 
      source: 'LinkedIn Reach',
      score: '98%',
      date: 'Today, 18:12',
      location: 'Amsterdam, NL',
      device: 'Chrome 126 (macOS)',
      interest: 'Mollie/Moneybird Custom Sync',
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
      source: 'AdWords Search',
      score: '84%',
      date: 'Today, 17:34',
      location: 'Utrecht, NL',
      device: 'Safari Mobile (iOS)',
      interest: 'Serverless Contract Automation',
      chat: [
        { sender: 'visitor', text: 'Do you offer custom document generation software for transport agreements?' },
        { sender: 'bot', text: 'Absolutely. We design serverless HTML-to-PDF generators processing up to thousands of agreements in seconds. Let me transfer you to an operator for customized pricing...' }
      ]
    },
    { 
      id: 'lead-3', 
      name: 'Mark De Jong (DutchTech)', 
      email: 'm.dejong@dutchtech.io', 
      source: 'Organic / Blog',
      score: '72%',
      date: 'Yesterday, 14:20',
      location: 'Eindhoven, NL',
      device: 'Firefox (Linux)',
      interest: 'Klantenportaal Bouwen',
      chat: [
        { sender: 'visitor', text: 'Subscribed to your scaling newsletter!' },
        { sender: 'bot', text: 'Welcome! We dispatch weekly B2B operational automation blueprints every Friday.' }
      ]
    },
    {
      id: 'lead-4',
      name: 'Alex F. (Velo Logistics)',
      email: 'alex@velo.nl',
      source: 'Cold Outreach',
      score: '96%',
      date: 'Yesterday, 10:15',
      location: 'Rotterdam, NL',
      device: 'Chrome (Windows)',
      interest: 'Real-time Lead Tracking',
      chat: [
        { sender: 'visitor', text: 'I saw your custom CRM build with push alerts. Can it sync with Exact Online?' },
        { sender: 'bot', text: 'Yes! We link Exact Online via custom webhooks so your sales status triggers accounting entries in real-time. I can get an engineer to demo this.' },
        { sender: 'visitor', text: 'Please do, that is exactly what we need.' }
      ]
    },
    {
      id: 'lead-5',
      name: 'Sarah Connor (Cyberdyne)',
      email: 'sconnor@cyberdyne.com',
      source: 'LinkedIn Reach',
      score: '91%',
      date: '2 Days Ago',
      location: 'Groningen, NL',
      device: 'Edge (Windows)',
      interest: 'AI Agent Call Routing',
      chat: [
        { sender: 'visitor', text: 'We get 100+ inbound leads daily. Can your AI filter out spam?' },
        { sender: 'bot', text: 'Yes, our agent uses GPT classification models to analyze company domains and score leads before routing them to your salespeople. Let me connect you to Sarah\'s handler Walid...' }
      ]
    },
    {
      id: 'lead-6',
      name: 'Bruce Wayne (Wayne Ent)',
      email: 'bruce@wayne.corp',
      source: 'Referral',
      score: '68%',
      date: '3 Days Ago',
      location: 'Gotham, US',
      device: 'Encrypted Browser',
      interest: 'Custom CRM Infrastructure',
      chat: [
        { sender: 'visitor', text: 'Looking for a secure, isolated database setup.' },
        { sender: 'bot', text: 'We host dedicated PostgreSQL setups behind SSL tunnels, keeping your data entirely isolated. No third-party SaaS caching.' }
      ]
    },
    {
      id: 'lead-7',
      name: 'Tony Stark (Stark Ind)',
      email: 'tony@stark.com',
      source: 'AdWords Search',
      score: '95%',
      date: '4 Days Ago',
      location: 'Malibu, US',
      device: 'Jarvis OS',
      interest: 'High-Fidelity Dashboards',
      chat: [
        { sender: 'visitor', text: 'I need a fast front-end that loads in under 1 second.' },
        { sender: 'bot', text: 'We build statically compiled React architectures deployed via CDN edges, achieving sub-400ms TTFB times.' }
      ]
    },
    {
      id: 'lead-8',
      name: 'Elon M. (X-Corp)',
      email: 'elon@x.com',
      source: 'Organic / Blog',
      score: '54%',
      date: '5 Days Ago',
      location: 'Texas, US',
      device: 'X-App Webview',
      interest: 'Newsletter Blueprint',
      chat: [
        { sender: 'visitor', text: 'Interesting workflows.' },
        { sender: 'bot', text: 'Thanks! Let me know if you would like to test our Stripe/Mollie triggers.' }
      ]
    }
  ]

  // Filter logic
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.interest.toLowerCase().includes(searchQuery.toLowerCase())
    
    const leadStatus = takeoverStates[l.id]
    const matchesStatus = statusFilter === 'all' || leadStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
                  <div className="label-row">
                    <span className="label">Total Leads</span>
                    <span className="growth-tag">+14.3%</span>
                  </div>
                  <div className="value-row">
                    <div className="value">154</div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 50 20" width="100%" height="100%">
                        <path d="M0,15 L10,12 L20,16 L30,8 L40,11 L50,3" fill="none" stroke="var(--crm-accent)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">In Takeover</span>
                    <span className="growth-tag" style={{ color: '#fbbf24' }}>Active</span>
                  </div>
                  <div className="value-row">
                    <div className="value">2</div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 50 20" width="100%" height="100%">
                        <path d="M0,10 L10,8 L20,12 L30,6 L40,14 L50,9" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Conv. Rate</span>
                    <span className="growth-tag">+2.8%</span>
                  </div>
                  <div className="value-row">
                    <div className="value">12.8%</div>
                    <div className="sparkline-container">
                      <svg viewBox="0 0 50 20" width="100%" height="100%">
                        <path d="M0,18 L10,14 L20,15 L30,10 L40,8 L50,4" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Live Automation Logs
                  </span>
                  <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--crm-border)', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '9px', color: '#cbd5e1', lineHeight: '1.6', height: '140px', overflowY: 'auto' }}>
                    <div><span style={{ color: 'var(--crm-accent)' }}>[19:12:02]</span> Lead "Walid G." triggered score alert: <span style={{ color: '#34d399' }}>98% high intent</span></div>
                    <div><span style={{ color: 'var(--crm-accent)' }}>[19:08:45]</span> Generated PDF invoice_INV-2026-904.pdf (1.4s)</div>
                    <div><span style={{ color: 'var(--crm-accent)' }}>[19:05:12]</span> Sync webhook dispatched to Moneybird (resolved 200 OK)</div>
                    <div><span style={{ color: 'var(--crm-accent)' }}>[19:01:00]</span> AI chatbot updated status to needs_human for "Alex F."</div>
                    <div><span style={{ color: 'var(--crm-accent)' }}>[18:45:30]</span> mollie_payout hook processed: Synced €4,500 ledger entry</div>
                  </div>
                </div>
                
                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Active Operators
                  </span>
                  <div className="b2b-crm-leaderboard" style={{ margin: 0, padding: '12px' }}>
                    <div className="b2b-crm-leader-row">
                      <div className="b2b-crm-leader-info">
                        <span className="b2b-crm-leader-avatar">🤖</span>
                        <span className="b2b-crm-leader-name">AI Agent 2.1</span>
                      </div>
                      <span className="b2b-crm-leader-value">74 Leads</span>
                    </div>
                    <div className="b2b-crm-leader-row">
                      <div className="b2b-crm-leader-info">
                        <span className="b2b-crm-leader-avatar" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)' }}>W</span>
                        <span className="b2b-crm-leader-name">Walid G.</span>
                      </div>
                      <span className="b2b-crm-leader-value">48 Leads</span>
                    </div>
                    <div className="b2b-crm-leader-row">
                      <div className="b2b-crm-leader-info">
                        <span className="b2b-crm-leader-avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>A</span>
                        <span className="b2b-crm-leader-name">Admin</span>
                      </div>
                      <span className="b2b-crm-leader-value">32 Leads</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Leads Bank View */}
          {activeTab === 'leads' && (
            <div>
              {/* Search and Filters */}
              <div className="b2b-crm-table-controls">
                <input 
                  type="text" 
                  className="b2b-crm-search-input"
                  placeholder="Search leads name, source, interest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                  className="b2b-crm-select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="needs_human">Needs Human</option>
                  <option value="bot_chatting">AI Chatting</option>
                  <option value="human_active">Human Active</option>
                  <option value="converted">Converted</option>
                </select>
              </div>

              {/* Grid Table */}
              <div className="b2b-crm-grid-table">
                <div className="b2b-crm-grid-header">
                  <span>Lead Contact</span>
                  <span>Source</span>
                  <span>Score</span>
                  <span>Status</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className={`b2b-crm-grid-row ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                        <div style={{ fontSize: '9px', color: 'var(--crm-text-muted)' }}>{lead.email}</div>
                      </div>
                      <span style={{ color: 'var(--crm-text-muted)' }}>{lead.source}</span>
                      <span style={{ fontWeight: 700, color: 'var(--crm-accent)' }}>{lead.score}</span>
                      <span className={`b2b-crm-badge ${takeoverStates[lead.id]}`}>
                        {takeoverStates[lead.id] === 'needs_human' ? 'Needs Human' : 
                         takeoverStates[lead.id] === 'bot_chatting' ? 'AI Chatting' : 
                         takeoverStates[lead.id] === 'taking_over' ? 'Connecting...' :
                         takeoverStates[lead.id] === 'human_active' ? 'Human Active' : 'Converted'}
                      </span>
                    </div>
                  ))}
                  {filteredLeads.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--crm-text-muted)', fontSize: '11px' }}>
                      No matching leads found.
                    </div>
                  )}
                </div>
              </div>

              {/* Side Drawer Lead details sheet */}
              {selectedLead && (
                <div className="b2b-crm-drawer">
                  <div className="b2b-crm-drawer-header">
                    <span className="b2b-crm-drawer-title">{selectedLead.name}</span>
                    <button className="b2b-crm-drawer-close" onClick={() => setSelectedLead(null)}>✕</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px', height: 'calc(100% - 30px)', overflowY: 'auto' }}>
                    <div className="b2b-crm-metadata-row">Location: <strong>{selectedLead.location}</strong></div>
                    <div className="b2b-crm-metadata-row">Device: <strong>{selectedLead.device}</strong></div>
                    <div className="b2b-crm-metadata-row">Interest: <strong style={{ color: 'var(--crm-accent)' }}>{selectedLead.interest}</strong></div>
                    <div className="b2b-crm-metadata-row">Intent Score: <strong style={{ color: '#34d399' }}>{selectedLead.score}</strong></div>
                    
                    {/* Simulated Chat Transcript */}
                    <span className="label" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', marginTop: '6px', color: 'var(--crm-text-muted)' }}>
                      Conversation Transcript
                    </span>
                    <div className="b2b-crm-chat-box">
                      {selectedLead.chat.map((msg, i) => (
                        <div key={i} className={`b2b-crm-chat-bubble ${msg.sender === 'visitor' ? 'visitor' : 'bot'}`}>
                          <span className="b2b-crm-chat-label">
                            {msg.sender === 'visitor' ? 'Visitor' : 'AI Assistant'}
                          </span>
                          <span className="b2b-crm-chat-text">
                            {msg.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="b2b-btn-primary" 
                      style={{ padding: '8px 12px', fontSize: '10.5px', marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                      disabled={takeoverStates[selectedLead.id] === 'human_active' || takeoverStates[selectedLead.id] === 'taking_over'}
                      onClick={() => triggerTakeover(selectedLead.id)}
                    >
                      {takeoverStates[selectedLead.id] === 'human_active' ? 'Connected' : 
                       takeoverStates[selectedLead.id] === 'taking_over' ? 'Connecting...' : 'Take Over Chat'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Email Campaigns View */}
          {activeTab === 'campaigns' && (
            <div className="b2b-crm-campaigns-list">
              {campaigns.map((camp) => (
                <div key={camp.id} className="b2b-crm-camp-card">
                  <div className="b2b-crm-camp-left">
                    <div className="b2b-crm-camp-icon">🎯</div>
                    <div className="b2b-crm-camp-details">
                      <h4>{camp.name}</h4>
                      <div className="b2b-crm-camp-stats">
                        <span>Sent: <strong>{camp.sent}</strong></span>
                        <span>Opens: <strong>{camp.open}</strong></span>
                        <span>Replies: <strong style={{ color: 'var(--crm-accent)' }}>{camp.reply}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {loadingInt === camp.id ? (
                      <div className="b2b-crm-spinner"></div>
                    ) : (
                      <label className="b2b-crm-switch" title={camp.active ? 'Pause Campaign' : 'Resume Campaign'}>
                        <input 
                          type="checkbox" 
                          checked={camp.active} 
                          onChange={() => toggleCampaign(camp.id)}
                        />
                        <span className="b2b-crm-slider"></span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Outreach Stats View */}
          {activeTab === 'analytics' && (
            <div>
              <div className="b2b-crm-chart-card">
                <span className="b2b-crm-chart-title">Outreach Conversion Curve (7 Days)</span>
                <svg viewBox="0 0 340 90" style={{ width: '100%', height: '70px', display: 'block', overflow: 'visible' }}>
                  <path
                    className="b2b-crm-chart-path"
                    d="M0,80 Q30,40 60,60 T120,30 T180,55 T240,25 T300,45 T340,10"
                    fill="none"
                    stroke="var(--crm-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    className="b2b-crm-chart-path"
                    d="M0,85 Q30,65 60,75 T120,50 T180,68 T240,45 T300,60 T340,30"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                </svg>
              </div>

              <div>
                <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Email Delivery Domain Health
                </span>
                <div className="b2b-crm-domain-list">
                  <div className="b2b-crm-domain-row">
                    <span style={{ fontWeight: 600 }}>@gmail.com</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>99.8% Inbox Rate</span>
                  </div>
                  <div className="b2b-crm-domain-row">
                    <span style={{ fontWeight: 600 }}>@outlook.com</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>99.4% Inbox Rate</span>
                  </div>
                  <div className="b2b-crm-domain-row">
                    <span style={{ fontWeight: 600 }}>Custom Business Domains</span>
                    <span style={{ color: 'var(--crm-accent)', fontWeight: 700 }}>98.7% Inbox Rate</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
