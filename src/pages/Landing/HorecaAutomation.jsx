import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../styles/landing-b2b.css'
import Navbar from '../../components/Navbar'
import PartnersStrip from '../../components/PartnersStrip'

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
      eyebrow: "Savings Calculator",
      heading: "See how much you",
      headingHighlight: "could save",
      subtitle: "Configure your restaurant setup to see how much revenue lost to no-shows, manual reservations, and phone bookings you can recover.",
      configureTitle: "Configure your setup",
      serviceType: "Establishment Type",
      employees: "Average Weekly Covers",
      hours: "No-Show / Cancellation Rate (%)",
      savingTitle: "You could save",
      savingSub: "per year · 85% recaptured no-show losses",
      perMonth: "Per month saving",
      overFive: "Over 5 years",
      breakdown: "Annual cost breakdown",
      manualCost: "Lost to manual bookings / no-shows",
      autoCost: "AutoFlow Automation",
      infoNote: "💡 Based on average Benelux hospitality no-show rates and table spends vs. AutoFlow's smart confirmations. Actual savings may vary."
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
    partner: {
      title: "Your Long-Term Operational Partner",
      subtitle: "Generic SaaS vendors sell monthly seats and walk away. AutoFlow Studio embeds with your hospitality management team to design, build, and continuously optimize your operational backbone.",
      p1Title: "100% Asset Ownership",
      p1Desc: "Zero monthly per-cover taxes or seat limits. You own your reservation engine, guest database, and shift system outright.",
      p2Title: "7-Day Turnkey Deployment",
      p2Desc: "We engineer, integrate your POS/Kassa (Lightspeed, Untill), and train your team in under 7 days.",
      p3Title: "Proactive 24/7 Operations",
      p3Desc: "We monitor SMS/WhatsApp webhooks, table syncs, and booking databases continuously so peak shifts run flawlessly.",
      p4Title: "Continuous Scaling & Upgrades",
      p4Desc: "As you open new venues or expand seating, we scale your shift planners and guest workflows automatically."
    },
    caseStudies: {
      title: "Proven Operational Impact",
      subtitle: "Real case studies from our portfolio demonstrating measurable operational savings and growth for food & hospitality brands.",
      case1Tag: "Food Tech & Platform",
      case1Title: "Homemade B.V. – €45,000+ Annual Savings & 5x Growth",
      case1Desc: "A Dutch food platform connecting 30+ home chefs faced inconsistent dish photos that hurt conversions and required €45,000+ in photographer fees. We built a custom AI photo enhancement tool integrated directly into chef dashboards.",
      case1Stat1Val: "€45,000+",
      case1Stat1Lbl: "Annual Savings",
      case1Stat2Val: "5x",
      case1Stat2Lbl: "Faster Chef Scaling",
      case1Stat3Val: "1,000+",
      case1Stat3Lbl: "Hours Reclaimed",
      case2Tag: "Hospitality & Guest Support",
      case2Title: "AI Guest Receptionist – 70% Support Workload Reduction",
      case2Desc: "A high-volume Dutch hospitality brand faced 200-300 daily guest inquiries on WhatsApp/Telegram. We deployed a 24/7 AI Receptionist connected to their live reservation database.",
      case2Stat1Val: "70%",
      case2Stat1Lbl: "Workload Reduction",
      case2Stat2Val: "Instant",
      case2Stat2Lbl: "24/7 Guest Response",
      case2Stat3Val: "€40,000+",
      case2Stat3Lbl: "Annual Cost Saved"
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
      eyebrow: "Besparingscalculator",
      heading: "Zie hoeveel je kunt",
      headingHighlight: "besparen",
      subtitle: "Configureer je horecazaak om te zien hoeveel omzetverlies door no-shows en handmatige boekingen je kunt voorkomen.",
      configureTitle: "Configureer je zaak",
      serviceType: "Type Horecagelegenheid",
      employees: "Gemiddeld Aantal Gasten/Week",
      hours: "No-Show Percentage (%)",
      savingTitle: "Je zou kunnen besparen",
      savingSub: "per jaar · 85% minder no-show verlies",
      perMonth: "Besparing per maand",
      overFive: "Over 5 jaar",
      breakdown: "Jaarlijkse kostenverdeling",
      manualCost: "Verlies door no-shows & administratie",
      autoCost: "AutoFlow Horeca",
      infoNote: "💡 Gebaseerd op gemiddelde Benelux horeca no-show percentages en gastbestedingen vs. AutoFlow's slimme bevestigingen. Werkelijke besparingen kunnen variëren."
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
    partner: {
      title: "Jouw Langetermijn Operationele Partner",
      subtitle: "Generieke SaaS-leveranciers verkopen je een maandelijks abonnement en verdwijnen. AutoFlow Studio werkt direct samen met jouw horecateam om je gehele digitale infrastructuur te bouwen en continu te optimaliseren.",
      p1Title: "100% Eigen Infrastructuur",
      p1Desc: "Geen maandelijkse commissies per gast of limieten. Je bezit je reserveringssysteem, gastendatabase en roosters voor altijd.",
      p2Title: "Sleutelklaar in 7 Dagen",
      p2Desc: "Wij bouwen, koppelen je kassasysteem (Lightspeed, Untill) en trainen je team binnen 7 dagen.",
      p3Title: "Proactieve 24/7 Ondersteuning",
      p3Desc: "Wij monitoren WhatsApp-triggers, database-koppelingen en reserveringen continu zodat piekmomenten vlekkeloos verlopen.",
      p4Title: "Continue Schaling & Updates",
      p4Desc: "Wanneer je een nieuwe vestiging opent of je capaciteit uitbreidt, schalen wij je planners en systemen direct mee."
    },
    caseStudies: {
      title: "Bewezen Operationele Impact",
      subtitle: "Echte case studies uit ons portfolio die meetbare besparingen en snelle groei aantonen voor horeca- en foodbedrijven.",
      case1Tag: "Food Tech & Platform",
      case1Title: "Homemade B.V. – €45.000+ Jaarlijkse Besparing & 5x Groei",
      case1Desc: "Een Nederlands maaltijdplatform met 30+ thuischefs kampte met wisselende fotokwaliteit wat conversie kostte en €45.000+ per jaar aan fotografen vergde. Wij bouwden een AI-fotoverbeteringstool direct in hun chef-dashboard.",
      case1Stat1Val: "€45.000+",
      case1Stat1Lbl: "Jaarlijkse Besparing",
      case1Stat2Val: "5x",
      case1Stat2Lbl: "Sneller Schalen",
      case1Stat3Val: "1.000+",
      case1Stat3Lbl: "Uren Bespaard",
      case2Tag: "Horeca & Gastenservice",
      case2Title: "AI Horeca Receptie – 70% Minder Support Werkdruk",
      case2Desc: "Een drukbezochte Nederlandse horecazaak verwerkte dagelijks 200-300 vragen via WhatsApp/Telegram. Wij lanceerden een 24/7 AI Receptie gekoppeld aan hun live reserveringssysteem.",
      case2Stat1Val: "70%",
      case2Stat1Lbl: "Minder Werkdruk",
      case2Stat2Val: "Direct",
      case2Stat2Lbl: "24/7 Antwoord",
      case2Stat3Val: "€40.000+",
      case2Stat3Lbl: "Jaarlijkse Besparing"
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
  const [establishmentType, setEstablishmentType] = useState('fine')
  const [covers, setCovers] = useState(400)
  const [noShowRate, setNoShowRate] = useState(8)
  const [avgBill, setAvgBill] = useState(85)

  const [wastedCost, setWastedCost] = useState(0)
  const [savings, setSavings] = useState(0)

  const handleEstablishmentTypeChange = (type) => {
    setEstablishmentType(type)
    if (type === 'fine') {
      setCovers(400)
      setNoShowRate(8)
      setAvgBill(85)
    } else if (type === 'bistro') {
      setCovers(600)
      setNoShowRate(6)
      setAvgBill(45)
    } else if (type === 'hotel') {
      setCovers(200)
      setNoShowRate(4)
      setAvgBill(120)
    } else if (type === 'events') {
      setCovers(100)
      setNoShowRate(3)
      setAvgBill(150)
    }
  }

  useEffect(() => {
    const annualWasted = covers * 52 * (noShowRate / 100) * avgBill
    setWastedCost(annualWasted)
    setSavings(Math.round(annualWasted * 0.85))
  }, [covers, noShowRate, avgBill])

  const coversPercent = ((covers - 50) / (2000 - 50)) * 100
  const noShowPercent = ((noShowRate - 2) / (20 - 2)) * 100

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

      {/* ── Asymmetrical Bento Solutions Section ── */}
      <section className="b2b-section alt-bg" id="solutions">
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '50px', background: 'rgba(244,63,94,0.1)', color: '#be123c', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'nl' ? 'Operationele Infrastructuur' : 'Operational Infrastructure'}
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              {t.solutions.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
              {t.solutions.subtitle}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px' }}>
            {/* Left Hero Bento Card: Direct Reservation Engine */}
            <div style={{ background: '#f1f5f9', borderRadius: '28px', padding: '10px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.03)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#be123c', display: 'block', marginBottom: '12px' }}>
                    0% COMMISSION DIRECT ENGINE
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 }}>
                    {t.solutions.portal.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '32px' }}>
                    {t.solutions.portal.desc}
                  </p>
                </div>

                {/* Interactive Live Micro-Widget: Direct Reservation Preview */}
                <div style={{ background: '#0f172a', borderRadius: '18px', padding: '24px', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>LIVE TABLE RESERVATION</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '50px', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700 }}>
                      0% Commission Fee
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Date & Time</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Tonight, 19:30</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Guests</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>4 Guests</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Deposit status</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>€50.00 Paid</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#fda4af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Savings vs. Third-Party Portals:</span>
                    <strong>+€14.50 Saved On This Table</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Stacked Bento Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Card 2: WhatsApp & SMS No-Show Prevention */}
              <div style={{ background: '#f1f5f9', borderRadius: '28px', padding: '10px', border: '1px solid rgba(15,23,42,0.08)' }}>
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '32px', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.03)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#be123c', display: 'block', marginBottom: '10px' }}>
                    AUTOMATED GUEST ALERTS
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    {t.solutions.integrations.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '20px' }}>
                    {t.solutions.integrations.desc}
                  </p>

                  {/* Micro WhatsApp Live Simulator */}
                  <div style={{ background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>WhatsApp Auto-Confirmation Sent</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Guest confirmed table #4 · No-show risk reduced by 85%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: POS & Shift Automation */}
              <div style={{ background: '#f1f5f9', borderRadius: '28px', padding: '10px', border: '1px solid rgba(15,23,42,0.08)' }}>
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '32px', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.03)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#be123c', display: 'block', marginBottom: '10px' }}>
                    KASSA & SHIFT ECOSYSTEM
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    {t.solutions.docs.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '20px' }}>
                    {t.solutions.docs.desc}
                  </p>

                  {/* Micro POS Sync Ticker */}
                  <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '12px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#10b981' }}>▶</span>
                    <span>Lightspeed POS → Table #12 Closed → Exact Online Invoice Dispatched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Double-Bezel Operational Partner Section ── */}
      <section className="b2b-section" style={{ background: '#ffffff', padding: '96px 0', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '50px', background: 'rgba(244,63,94,0.1)', color: '#be123c', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              OPERATIONAL PARTNERSHIP
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              {t.partner.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
              {t.partner.subtitle}
            </p>
          </div>

          {/* Double-Bezel Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '24px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', padding: '28px 20px', borderRadius: '18px', height: '100%', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>🏰</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{t.partner.p1Title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{t.partner.p1Desc}</p>
              </div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '24px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', padding: '28px 20px', borderRadius: '18px', height: '100%', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>⚡</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{t.partner.p2Title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{t.partner.p2Desc}</p>
              </div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '24px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', padding: '28px 20px', borderRadius: '18px', height: '100%', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>🛡️</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{t.partner.p3Title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{t.partner.p3Desc}</p>
              </div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '24px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', padding: '28px 20px', borderRadius: '18px', height: '100%', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>📈</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{t.partner.p4Title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{t.partner.p4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Portfolio Case Studies Spotlight ── */}
      <section className="b2b-section alt-bg" style={{ padding: '96px 0', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        <div className="b2b-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '50px', background: 'rgba(244,63,94,0.1)', color: '#be123c', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
              PROVEN RESULTS
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              {t.caseStudies.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '760px', margin: '0 auto', lineHeight: 1.6 }}>
              {t.caseStudies.subtitle}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Case 1: Homemade B.V. */}
            <div style={{ background: '#f1f5f9', borderRadius: '28px', padding: '8px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '36px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.03)' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '50px', background: 'rgba(244,63,94,0.1)', color: '#be123c', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    {t.caseStudies.case1Tag}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 }}>
                    {t.caseStudies.case1Title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
                    {t.caseStudies.case1Desc}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(15,23,42,0.08)' }}>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>{t.caseStudies.case1Stat1Val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{t.caseStudies.case1Stat1Lbl}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>{t.caseStudies.case1Stat2Val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{t.caseStudies.case1Stat2Lbl}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>{t.caseStudies.case1Stat3Val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{t.caseStudies.case1Stat3Lbl}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <Link to="/portfolio/project-1" style={{ color: '#be123c', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {lang === 'nl' ? 'Lees Volledige Case Study →' : 'Read Full Case Study →'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Case 2: AI Guest Receptionist */}
            <div style={{ background: '#f1f5f9', borderRadius: '28px', padding: '8px', border: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '36px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.03)' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '50px', background: 'rgba(244,63,94,0.1)', color: '#be123c', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px' }}>
                    {t.caseStudies.case2Tag}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 }}>
                    {t.caseStudies.case2Title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' }}>
                    {t.caseStudies.case2Desc}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(15,23,42,0.08)' }}>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>{t.caseStudies.case2Stat1Val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{t.caseStudies.case2Stat1Lbl}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>{t.caseStudies.case2Stat2Val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{t.caseStudies.case2Stat2Lbl}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c' }}>{t.caseStudies.case2Stat3Val}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{t.caseStudies.case2Stat3Lbl}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <Link to="/portfolio/project-2" style={{ color: '#be123c', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {lang === 'nl' ? 'Lees Volledige Case Study →' : 'Read Full Case Study →'}
                    </Link>
                  </div>
                </div>
              </div>
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
                    onClick={() => handleEstablishmentTypeChange('fine')} 
                    className={`calc-select-btn ${establishmentType === 'fine' ? 'active' : ''}`}
                  >
                    Fine Dining
                  </button>
                  <button 
                    onClick={() => handleEstablishmentTypeChange('bistro')} 
                    className={`calc-select-btn ${establishmentType === 'bistro' ? 'active' : ''}`}
                  >
                    Casual Bistro
                  </button>
                  <button 
                    onClick={() => handleEstablishmentTypeChange('hotel')} 
                    className={`calc-select-btn ${establishmentType === 'hotel' ? 'active' : ''}`}
                  >
                    Boutique Hotel
                  </button>
                  <button 
                    onClick={() => handleEstablishmentTypeChange('events')} 
                    className={`calc-select-btn ${establishmentType === 'events' ? 'active' : ''}`}
                  >
                    Event Venue
                  </button>
                </div>
              </div>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.employees}</label>
                  <span className="value">{covers}</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="50"
                  value={covers} 
                  onChange={e => setCovers(parseInt(e.target.value))} 
                  className="calc-slider"
                  style={{
                    background: `linear-gradient(to right, var(--b2b-primary) 0%, var(--b2b-primary) ${coversPercent}%, #cbd5e1 ${coversPercent}%, #cbd5e1 100%)`
                  }}
                />
                <div className="calc-slider-footer">
                  <span>50 guests</span>
                  <span>2000 guests</span>
                </div>
              </div>

              <div className="calc-field-group">
                <div className="calc-slider-header">
                  <label>{t.roi.hours}</label>
                  <span className="value">{noShowRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="20" 
                  step="1"
                  value={noShowRate} 
                  onChange={e => setNoShowRate(parseInt(e.target.value))} 
                  className="calc-slider"
                  style={{
                    background: `linear-gradient(to right, var(--b2b-primary) 0%, var(--b2b-primary) ${noShowPercent}%, #cbd5e1 ${noShowPercent}%, #cbd5e1 100%)`
                  }}
                />
                <div className="calc-slider-footer">
                  <span>2%</span>
                  <span>20%</span>
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
