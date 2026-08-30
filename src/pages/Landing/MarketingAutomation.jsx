import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/landing-b2b.css'
import Navbar from '../../components/Navbar'
import PartnersStrip from '../../components/PartnersStrip'

const TRANSLATIONS = {
  en: {
    meta: {
      title: "Scale Your Marketing Agency Operations Without the Account Manager Tax | AutoFlow Studio",
      desc: "Stop wasting billable agency hours on manual PDF reports and onboarding emails. We build custom client reporting portals, automated onboarding workflows, and database integrations tailored to your agency."
    },
    nav: {
      solutions: "Solutions",
      painPoints: "The Problem",
      roi: "ROI Calculator",
      contact: "Get Started"
    },
    hero: {
      eyebrow: "Digital Agency Automation",
      heading: "Scale Agency Operations Without the ",
      headingHighlight: "Account Manager Tax",
      desc: "Tired of copy-pasting data for monthly client reports, manual onboarding follow-ups, and expensive SaaS licenses? We design and engineer premium custom agency portals, automated ad report generators, and secure database tools that run your agency on autopilot.",
      ctaPrimary: "Book an Agency Audit",
      ctaSecondary: "Calculate Your ROI"
    },
    pains: {
      title: "Why Traditional Marketing Agencies Fail to Scale",
      subtitle: "The more clients you win, the more manual report-compiling and communication overhead your account managers face. Hiring more managers is a temporary band-aid, not a scaling strategy.",
      card1: {
        title: "Manual Reporting Overhead",
        desc: "Account managers spending days copy-pasting Facebook, Google, and LinkedIn ad metrics into PowerPoint decks every month."
      },
      card2: {
        title: "Bottlenecked Client Onboarding",
        desc: "Waiting on clients to upload assets, share logins, and fill briefs. Weeks pass with zero progress due to manual coordination delay."
      },
      card3: {
        title: "Rigid Software Licensing Fees",
        desc: "Generic client portals and reporting tools penalize you for growing. As you add clients, your monthly licensing fees skyrocket."
      }
    },
    solutions: {
      title: "Engineered For Agency Scaling",
      subtitle: "We replace manual updates and seat licenses with custom software assets that your agency owns forever. No limits, infinite API integration freedom.",
      portal: {
        title: "Automated Reporting Hubs",
        desc: "Give your clients a secure dashboard displaying live, unified performance metrics pulling directly from Facebook Ads, Google Ads, and LinkedIn APIs."
      },
      crm: {
        title: "Custom Onboarding Portals",
        desc: "Interactive client portals to collect brand assets, retrieve Google/Meta advertiser access, and complete strategy briefs on autopilot."
      },
      integrations: {
        title: "Native API Pipelines",
        desc: "Securely link ad network performance data to trigger automated Slack digests, Moneybird invoice compiles, or project updates."
      },
      docs: {
        title: "Client Portal Deliverables",
        desc: "Instantly render and deliver clean PDF analytical reports, proposal decks, or campaign summaries in single-digit seconds."
      }
    },
    roi: {
      eyebrow: "Savings Calculator",
      heading: "See how much you",
      headingHighlight: "could save",
      subtitle: "Configure your agency parameters to see how much client communication, onboarding, and reporting hours you can automate.",
      configureTitle: "Configure your agency",
      serviceType: "Agency Type",
      employees: "Active Client Accounts",
      hours: "Reporting hours / client / month",
      savingTitle: "You could save",
      savingSub: "per year · 85% less administrative churn",
      perMonth: "Per month saving",
      overFive: "Over 5 years",
      breakdown: "Annual cost breakdown",
      manualCost: "Lost to reporting / onboarding overhead",
      autoCost: "AutoFlow Automation",
      infoNote: "💡 Based on average Benelux digital agency metrics and account management rates vs. AutoFlow client portal automation. Actual savings may vary."
    },
    steps: {
      title: "The Path to Automated Operations",
      step1: {
        title: "Operational Audit",
        desc: "We analyze your agency's reporting workflows, onboarding bottlenecks, and software stack to pinpoint manual leaks."
      },
      step2: {
        title: "High-End Blueprint",
        desc: "We design pixel-perfect mockups and interactive client portals matching your agency's branding."
      },
      step3: {
        title: "System Engineering",
        desc: "We build secure database connections (Postgres) and pull from advertising APIs (Google, Meta) for fast dashboard rendering."
      },
      step4: {
        title: "Autonomous Launch",
        desc: "Your custom agency portal goes live, reporting runs in real-time, and onboarding runs on autopilot."
      }
    },
    cta: {
      title: "Ready to Scale Your Agency on Autopilot?",
      desc: "Stop paying monthly rent on rigid client portal software. Let's design and build a custom system that fits your agency's workflows perfectly.",
      button: "Schedule a Discovery Call"
    }
  },
  nl: {
    meta: {
      title: "Schaal je marketingbureau zonder accountmanager overhead | AutoFlow Studio",
      desc: "Stop met het handmatig knippen en plakken van advertentiestatistieken in PDF-rapporten. Wij bouwen live rapportageportalen en automatische onboarding-workflows op maat."
    },
    nav: {
      solutions: "Oplossingen",
      painPoints: "Het Probleem",
      roi: "ROI Calculator",
      contact: "Aan de slag"
    },
    hero: {
      eyebrow: "Digital Agency Automatisering",
      heading: "Schaal je marketingbureau zonder extra ",
      headingHighlight: "Accountmanager overhead",
      desc: "Moe van het kopiëren van data voor maandelijkse rapportages, handmatige onboarding en dure softwarelicenties? Wij ontwerpen en bouwen op maat gemaakte klantenportalen, automatische rapportage-engines en veilige koppelingen.",
      ctaPrimary: "Boek een Bureau Audit",
      ctaSecondary: "Bereken je ROI"
    },
    pains: {
      title: "Waarom Traditionele Marketingbureaus Moeilijk Schalen",
      subtitle: "Hoe meer klanten je wint, hoe meer handmatig rapportage- en communicatiewerk er ontstaat. Meer accountmanagers aannemen is een tijdelijke pleister, geen schaalbare strategie.",
      card1: {
        title: "Enorme Rapportage Overhead",
        desc: "Accountmanagers besteden dagen aan het kopiëren van Facebook, Google en LinkedIn statistieken naar PowerPoint decks aan het einde van elke maand."
      },
      card2: {
        title: "Trage Klanten-Onboarding",
        desc: "Wachten op klanten die bestanden moeten uploaden, inloggegevens moeten delen en briefings moeten invullen. Uren gaan verloren door gebrek aan structuur."
      },
      card3: {
        title: "Dure Softwarelicenties per Seat",
        desc: "Standaard rapportagetools en klantenportalen bestraffen je voor groei. Zodra je klanten toevoegt, schieten je maandelijkse softwarekosten omhoog."
      }
    },
    solutions: {
      title: "Gebouwd Voor Bureau Opschaling",
      subtitle: "Wij vervangen handmatige updates en seat-licenties door op maat gemaakte software-assets die je bureau voor altijd bezit.",
      portal: {
        title: "Live Rapportage Portalen",
        desc: "Geef klanten een beveiligd dashboard met live, geconsolideerde prestatiegegevens direct gekoppeld aan de API's van Facebook en Google."
      },
      crm: {
        title: "Klanten-Onboarding Portalen",
        desc: "Interactieve portalen waarmee klanten automatisch merkbestanden uploaden, briefings invullen en advertentietoegangen verlenen."
      },
      integrations: {
        title: "Native API Koppelingen",
        desc: "Koppel advertentiedata aan automatische Slack-updates, Moneybird-facturatie en projectmanagement-workflows."
      },
      docs: {
        title: "Klantenportaal PDF-Rapporten",
        desc: "Genereer en lever direct professionele PDF-rapportages, pitch-decks of campagnestatistieken in minder dan 2 seconden."
      }
    },
    roi: {
      eyebrow: "Besparingscalculator",
      heading: "Zie hoeveel je kunt",
      headingHighlight: "besparen",
      subtitle: "Configureer je agency om te zien hoeveel uren aan rapportages, klantcommunicatie en onboarding je kunt automatiseren.",
      configureTitle: "Configureer je bureau",
      serviceType: "Type Bureau",
      employees: "Actieve Klantaccounts",
      hours: "Rapportage-uren / klant / maand",
      savingTitle: "Je zou kunnen besparen",
      savingSub: "per jaar · 85% minder administratieve uren",
      perMonth: "Besparing per maand",
      overFive: "Over 5 jaar",
      breakdown: "Jaarlijkse kostenverdeling",
      manualCost: "Handmatige rapportage overhead",
      autoCost: "AutoFlow Agency",
      infoNote: "💡 Gebaseerd op gemiddelde Benelux agency tarieven en accountmanagement uren vs. AutoFlow's automatische client portals. Werkelijke besparingen kunnen variëren."
    },
    steps: {
      title: "De Route Naar Geautomatiseerde Groei",
      step1: {
        title: "Operationele Audit",
        desc: "We analyseren de onboarding- en rapportagestromen van je bureau om de grootste tijdlekken te dichten."
      },
      step2: {
        title: "Hoogwaardig Ontwerp",
        desc: "We ontwerpen een pixel-perfect klantenportaal in de look-and-feel van jouw bureau."
      },
      step3: {
        title: "Systeembouw",
        desc: "We leggen koppelingen met ad-netwerken (Meta, Google) voor een razendsnelle verwerking van data."
      },
      step4: {
        title: "Autonome Lancering",
        desc: "Je klantenportaal gaat live, rapportages verversen live en je onboarding loopt volledig op autopilot."
      }
    },
    cta: {
      title: "Klaar Om Je Bureau te Automatiseren?",
      desc: "Stop met het betalen van maandelijkse licenties per klant aan standaardportalen. Laten we jouw perfecte bureausysteem bouwen.",
      button: "Plan je Discovery Call"
    }
  }
}

export default function MarketingAutomation({ lang }) {
  const navigate = useNavigate()
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  // ROI Calculator States
  const [agencyType, setAgencyType] = useState('full')
  const [clients, setClients] = useState(15)
  const [hours, setHours] = useState(8)
  const [labor, setLabor] = useState(85)

  const [wastedCost, setWastedCost] = useState(0)
  const [savings, setSavings] = useState(0)

  const handleAgencyTypeChange = (type) => {
    setAgencyType(type)
    if (type === 'full') {
      setClients(15)
      setHours(8)
      setLabor(85)
    } else if (type === 'performance') {
      setClients(20)
      setHours(10)
      setLabor(75)
    } else if (type === 'creative') {
      setClients(10)
      setHours(6)
      setLabor(90)
    } else if (type === 'seo') {
      setClients(25)
      setHours(6)
      setLabor(65)
    }
  }

  useEffect(() => {
    const annualWasted = clients * hours * 12 * labor
    setWastedCost(annualWasted)
    setSavings(Math.round(annualWasted * 0.85))
  }, [clients, hours, labor])

  const clientsPercent = ((clients - 5) / (100 - 5)) * 100
  const hoursPercent = ((hours - 2) / (20 - 2)) * 100

  useEffect(() => {
    document.title = t.meta.title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', t.meta.desc)
    }
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      favicon.setAttribute('href', '/images/logo_red.png')
    }
  }, [lang])

  const openBooking = () => {
    window.dispatchEvent(
      new CustomEvent('open-booking', {
        detail: { query: 'Digital Agency Operations Audit request from Standalone Landing Page' }
      })
    )
  }

  const switchLang = (toLang) => {
    if (toLang === 'nl') {
      navigate('/nl/solutions/marketing-agency')
    } else {
      navigate('/solutions/marketing-agency')
    }
  }

  return (
    <div className="b2b-landing red-landing">
      <Navbar />

      {/* Hero Section */}
      <section className="b2b-section" style={{ paddingTop: '180px', paddingBottom: '100px' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
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

      {/* Partners & APIs Strip */}
      <PartnersStrip lang={lang} darkBg={false} />

      {/* Interactive CRM Demo */}
      <section className="b2b-section alt-bg" id="solutions" style={{ padding: '80px 0' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>See Your Custom Reporting Portal In Action</h2>
            <p style={{ color: 'var(--b2b-text-muted)', maxWidth: '650px', margin: '0 auto' }}>
              We build custom reporting boards and onboarding trackers. Toggle tabs below to preview the interface.
            </p>
          </div>

          <MarketingCrmDemo />
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="b2b-section" id="problem">
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{t.pains.title}</h2>
            <p style={{ color: 'var(--b2b-text-muted)', maxWidth: '750px', margin: '0 auto' }}>
              {t.pains.subtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">📊</span>
              <h3>{t.pains.card1.title}</h3>
              <p>{t.pains.card1.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">⚙️</span>
              <h3>{t.pains.card2.title}</h3>
              <p>{t.pains.card2.desc}</p>
            </div>
            <div className="b2b-pain-card">
              <span className="b2b-pain-icon">🏢</span>
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
        <div className="calc-container">
          <div className="calc-header">
            <h2 className="calc-title">{t.roi.heading}<br /><span>{t.roi.headingHighlight}</span></h2>
          </div>

          <div className="calc-grid">
            {/* Left Column: Configuration */}
            <div className="calc-card">
              <h3 className="calc-card-title">{t.roi.configureTitle}</h3>

              <div className="calc-field-group">
                <label className="calc-field-label">{t.roi.serviceType}</label>
                <div className="calc-btn-grid">
                  <button 
                    onClick={() => handleAgencyTypeChange('full')} 
                    className={`calc-select-btn ${agencyType === 'full' ? 'active' : ''}`}
                  >
                    Full-Service Agency
                  </button>
                  <button 
                    onClick={() => handleAgencyTypeChange('performance')} 
                    className={`calc-select-btn ${agencyType === 'performance' ? 'active' : ''}`}
                  >
                    Performance Marketing
                  </button>
                  <button 
                    onClick={() => handleAgencyTypeChange('creative')} 
                    className={`calc-select-btn ${agencyType === 'creative' ? 'active' : ''}`}
                  >
                    Creative Studio
                  </button>
                  <button 
                    onClick={() => handleAgencyTypeChange('seo')} 
                    className={`calc-select-btn ${agencyType === 'seo' ? 'active' : ''}`}
                  >
                    SEO & Content
                  </button>
                </div>
              </div>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.employees}</label>
                  <span className="value">{clients}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={clients} 
                  onChange={e => setClients(parseInt(e.target.value))} 
                  className="calc-slider"
                  style={{
                    background: `linear-gradient(to right, var(--b2b-primary) 0%, var(--b2b-primary) ${clientsPercent}%, #cbd5e1 ${clientsPercent}%, #cbd5e1 100%)`
                  }}
                />
                <div className="calc-slider-footer">
                  <span>5 clients</span>
                  <span>100 clients</span>
                </div>
              </div>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.hours}</label>
                  <span className="value">{hours}h</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
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
                  <span>2h</span>
                  <span>20h / month</span>
                </div>
              </div>

              <div className="calc-info-note">
                <p>{t.roi.infoNote}</p>
              </div>
            </div>

            {/* Right Column: Savings & Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Card */}
              <div className="calc-summary-card">
                <p className="label">{t.roi.savingTitle}</p>
                <div className="calc-summary-value">€{savings.toLocaleString()}</div>
                <p className="calc-summary-sub">{t.roi.savingSub}</p>
                <div className="calc-divider"></div>
                <div className="calc-submetrics">
                  <div>
                    <p className="calc-submetric-label">{t.roi.perMonth}</p>
                    <p className="calc-submetric-value">€{Math.round(savings / 12).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="calc-submetric-label">{t.roi.overFive}</p>
                    <p className="calc-submetric-value">€{(savings * 5).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Breakdown Card */}
              <div className="calc-breakdown-card">
                <h4 className="calc-breakdown-title">{t.roi.breakdown}</h4>
                <div className="calc-progress-group">
                  <div className="calc-progress-header">
                    <span className="calc-progress-label">{t.roi.manualCost}</span>
                    <span className="calc-progress-value">€{wastedCost.toLocaleString()}</span>
                  </div>
                  <div className="calc-progress-bar-bg">
                    <div className="calc-progress-bar" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="calc-progress-group">
                  <div className="calc-progress-header">
                    <span className="calc-progress-label">{t.roi.autoCost}</span>
                    <span className="calc-progress-value highlight">€{Math.round(wastedCost - savings).toLocaleString()}</span>
                  </div>
                  <div className="calc-progress-bar-bg">
                    <div 
                      className="calc-progress-bar highlight" 
                      style={{ 
                        width: `${Math.round(((wastedCost - savings) / wastedCost) * 100)}%`,
                        transition: 'width 0.15s ease-out'
                      }}
                    ></div>
                  </div>
                </div>

                <div className="calc-btn-container">
                  <button onClick={openBooking} className="calc-cta-btn">
                    {t.cta.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="b2b-section alt-bg">
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
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

function MarketingCrmDemo() {
  const [theme, setTheme] = useState('indigo') // blue, emerald, indigo
  const [activeTab, setActiveTab] = useState('metrics') // metrics, onboarding, live_log
  const [searchQuery, setSearchQuery] = useState('')

  const [campaigns, setCampaigns] = useState([
    { id: '1', client: 'Alpha Clean Tech', network: 'Meta Ads', spend: '€2,400', roas: '4.2x', status: 'Running' },
    { id: '2', client: 'Nova Dental Care', network: 'Google Search', spend: '€1,800', roas: '3.8x', status: 'Running' },
    { id: '3', client: 'Velo Logistics', network: 'LinkedIn Lead Gen', spend: '€3,500', roas: '2.1x', status: 'Pending Review' },
    { id: '4', client: 'Skyward SaaS', network: 'Meta Ads', spend: '€0', roas: '0.0x', status: 'Paused' }
  ])

  const [logMessages, setLogMessages] = useState([
    '[12:00:15] Generated Facebook Ads raw metrics log for Nova Dental',
    '[11:48:10] Client Portal brief submitted by "Velo Logistics" (uploaded 4 assets)',
    '[11:32:00] Google Ads API sync resolved (fetched €1,800 ad spend records)',
    '[11:15:30] AutoFlow compiled monthly PDF performance report for Alpha Clean Tech (1.8s)',
    '[10:55:00] Slack notification dispatched: client onboarding flow initialized'
  ])

  const handleCreateCampaign = () => {
    if (!searchQuery.trim()) return alert('Please enter client name for Table 4.')
    const newLog = `[${new Date().toLocaleTimeString()}] Resuming campaigns for ${searchQuery} (Meta Ads)`
    setLogMessages(prev => [newLog, ...prev])
    setCampaigns(prev => prev.map(c => c.id === '4' ? { ...c, client: searchQuery, status: 'Running', spend: '€1,200', roas: '3.1x' } : c))
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
          <span>autoflow.studio/agency/reports</span>
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
          <button className={`b2b-crm-nav-item ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>
            <span>📊</span>
            Client Metrics
          </button>
          <button className={`b2b-crm-nav-item ${activeTab === 'onboarding' ? 'active' : ''}`} onClick={() => setActiveTab('onboarding')}>
            <span>⚙️</span>
            Onboarding Briefs
          </button>
          <button className={`b2b-crm-nav-item ${activeTab === 'live_log' ? 'active' : ''}`} onClick={() => setActiveTab('live_log')}>
            <span>📈</span>
            Performance Logs
          </button>
        </div>

        {/* Main Content */}
        <div className="b2b-crm-main">
          {activeTab === 'metrics' && (
            <div>
              <div className="b2b-crm-stats-grid">
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Accounts Synced</span>
                    <span className="growth-tag" style={{ color: '#10b981' }}>15 Active</span>
                  </div>
                  <div className="value-row">
                    <div className="value">15 / 15</div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Monthly Reports Compile</span>
                    <span className="growth-tag" style={{ color: '#10b981' }}>Auto Generated</span>
                  </div>
                  <div className="value-row">
                    <div className="value">100%</div>
                  </div>
                </div>
                <div className="b2b-crm-stat-card">
                  <div className="label-row">
                    <span className="label">Synced Ad Spend</span>
                    <span className="growth-tag">+14.2%</span>
                  </div>
                  <div className="value-row">
                    <div className="value">€28,450</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Live Ad Accounts Performance Table
                  </span>
                  
                  <div className="b2b-crm-table-container">
                    <table className="b2b-crm-table">
                      <thead>
                        <tr>
                          <th>Client Account</th>
                          <th>Network</th>
                          <th>Spend</th>
                          <th>ROAS</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(c => (
                          <tr key={c.id}>
                            <td><strong>{c.client}</strong></td>
                            <td style={{ color: '#cbd5e1' }}>{c.network}</td>
                            <td>{c.spend}</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>{c.roas}</td>
                            <td>
                              <span style={{ 
                                padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                                background: c.status === 'Running' ? 'rgba(16, 185, 129, 0.1)' : c.status === 'Pending Review' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(255,255,255,0.05)',
                                color: c.status === 'Running' ? '#10b981' : c.status === 'Pending Review' ? '#fb923c' : '#94a3b8'
                              }}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input 
                      type="text" placeholder="Enter paused client name to resume Meta Ads campaign..." 
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--crm-border)', borderRadius: '6px', color: 'white', fontSize: '11px', outline: 'none' }}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleCreateCampaign} style={{ padding: '8px 16px', background: 'var(--b2b-primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      Resume Ad Spend
                    </button>
                  </div>
                </div>

                <div>
                  <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Live Agency Automation API Log
                  </span>
                  <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--crm-border)', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '9px', color: '#cbd5e1', lineHeight: '1.6', height: '175px', overflowY: 'auto' }}>
                    {logMessages.map((log, i) => (
                      <div key={i}><span style={{ color: 'var(--b2b-primary)' }}>[API]</span> {log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'onboarding' && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '16px' }}>Client Onboarding Form Tracker</span>
              
              <div style={{ width: '320px', background: '#0a0a0a', border: '1px solid var(--crm-border)', borderRadius: '24px', padding: '20px', margin: '0 auto', textAlign: 'left', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--crm-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Onboarding: Velo Logistics</span>
                  <span style={{ color: '#fbbf24', fontSize: '10px' }}>In Progress</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <span>Brief questionnaire</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Submitted</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <span>Ad Accounts Access</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Connected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                    <span>Brand guidelines & logos</span>
                    <span style={{ color: '#fb923c', fontWeight: 700 }}>Awaiting Upload</span>
                  </div>
                </div>

                <button style={{ width: '100%', padding: '10px', background: 'var(--b2b-primary)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
                  Trigger Slack Ping
                </button>
              </div>
            </div>
          )}

          {activeTab === 'live_log' && (
            <div>
              <span className="label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--crm-text-muted)', display: 'block', marginBottom: '12px' }}>Monthly Agency Work Recovered</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--crm-border)', borderRadius: '16px', padding: '24px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Revenue Lost (Manual Reporting)</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fecdd3', marginTop: '8px' }}>€9,000</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>AutoFlow Savings Generated</span>
                  <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>€7,650</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
