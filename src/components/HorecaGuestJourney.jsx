import React, { useState } from 'react'

export default function HorecaGuestJourney({ lang = 'en' }) {
  const [activeTab, setActiveTab] = useState('before')

  const content = {
    en: {
      tag: "03 / END-TO-END GUEST AUTOMATION",
      title: "The 3-Phase Automated Guest Lifecycle",
      subtitle: "From initial web discovery to post-dining review loyalty, we automate every guest touchpoint to maximize revenue and eliminate manual coordination.",
      tabs: {
        before: "1. Before Service (Pre-Arrival)",
        during: "2. During Service (Floor Operations)",
        after: "3. After Service (Retention & Reviews)"
      },
      before: {
        step1Title: "Direct Web Booking (0% Fee)",
        step1Desc: "Guests reserve directly on your site with instant iDEAL / Apple Pay deposit pre-authorizations.",
        step2Title: "WhatsApp 24h Conversational Confirmation",
        step2Desc: "Automated 2-way WhatsApp messages confirm attendance or auto-release seats to waiting lists.",
        step3Title: "Guest CRM Auto-Tagging",
        step3Desc: "Automatically logs dietary allergies, favorite wine pairings, and VIP spend history."
      },
      during: {
        step1Title: "Lightspeed & Untill POS Sync",
        step1Desc: "Server tablets display guest preferences, dietary alerts, and live table turn countdowns.",
        step2Title: "Kitchen Display (KDS) Pacing",
        step2Desc: "Courses are paced automatically based on table arrival times to prevent dining bottlenecks.",
        step3Title: "Automated Tab Checkout",
        step3Desc: "Closing a check on POS instantly updates table availability and dispatches invoice to accounting."
      },
      after: {
        step1Title: "Private SMS Feedback Survey",
        step1Desc: "Sent 2 hours after dining to capture instant feedback and protect public review scores.",
        step2Title: "1-Tap Google Review Booster",
        step2Desc: "Happy guests are automatically prompted to leave a 5-star Google review.",
        step3Title: "45-Day Inactive Win-Back",
        step3Desc: "Automated re-engagement campaign invites lapsed diners back with personalized perks."
      }
    },
    nl: {
      tag: "03 / INTEGRALE GASTENAUTOMATISERING",
      title: "De 3-Fasen Geautomatiseerde Gastenlevenscyclus",
      subtitle: "Van eerste reservering tot beoordeling en herhaalbezoek: wij automatiseren elk contactmoment om omzet te verhogen en handmatig werk te schrappen.",
      tabs: {
        before: "1. Voor de Dienst (Reservering)",
        during: "2. Tijdens de Dienst (Zaalbeheer)",
        after: "3. Na de Dienst (Retentie & Reviews)"
      },
      before: {
        step1Title: "Directe Webreservering (0% Commissie)",
        step1Desc: "Gasten reserveren op jouw site met directe iDEAL / Apple Pay aanbetalingen.",
        step2Title: "WhatsApp 24u Automatische Bevestiging",
        step2Desc: "Automatische berichten bevestigen de komst of geven stoelen vrij aan de wachtlijst.",
        step3Title: "Gast CRM Automatische Labels",
        step3Desc: "Slaat automatisch dieetwensen, favoriete wijnen en VIP-bestedingen op."
      },
      during: {
        step1Title: "Kassa (POS) Synchronisatie",
        step1Desc: "Zaalpersoneel ziet direct allergenen, VIP-status en verwachte tafelwissels.",
        step2Title: "Keukenscherm (KDS) Tempo",
        step2Desc: "Gangen worden automatisch getimed om wachttijden in de keuken te voorkomen.",
        step3Title: "Automatische Tab Afhandeling",
        step3Desc: "Afrekenen op de kassa zet de tafel op groen en stuurt de factuur naar de boekhouding."
      },
      after: {
        step1Title: "Privé SMS Feedback Enquête",
        step1Desc: "2 uur na het diner verzonden om feedback op te halen en je reputatie te beschermen.",
        step2Title: "1-Klik Google Review Booster",
        step2Desc: "Tevreden gasten worden automatisch uitgenodigd om een 5-sterren review te plaatsen.",
        step3Title: "45-Dagen Win-Back Campagne",
        step3Desc: "Automatische heractivatie nodigt afwezige gasten uit met een persoonlijke attentie."
      }
    }
  }

  const t = content[lang] || content.en
  const currentPhase = t[activeTab]

  return (
    <div style={{ background: '#eae6df', borderRadius: '32px', padding: '12px', border: '1px solid rgba(28,25,23,0.1)' }}>
      <div style={{ background: '#faf8f5', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px -15px rgba(28,25,23,0.05)' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#991b1b', marginBottom: '10px' }}>
            {t.tag}
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 400, color: '#1c1917', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', marginBottom: '14px', letterSpacing: '-0.02em' }}>
            {t.title}
          </h2>
          <p style={{ color: '#57534e', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Interactive Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '40px', background: '#e7e3dc', padding: '6px', borderRadius: '50px', border: '1px solid rgba(28,25,23,0.08)' }}>
          <button
            onClick={() => setActiveTab('before')}
            style={{
              padding: '12px 20px',
              borderRadius: '50px',
              border: 'none',
              background: activeTab === 'before' ? '#1c1917' : 'transparent',
              color: activeTab === 'before' ? '#faf8f5' : '#57534e',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            {t.tabs.before}
          </button>
          <button
            onClick={() => setActiveTab('during')}
            style={{
              padding: '12px 20px',
              borderRadius: '50px',
              border: 'none',
              background: activeTab === 'during' ? '#1c1917' : 'transparent',
              color: activeTab === 'during' ? '#faf8f5' : '#57534e',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            {t.tabs.during}
          </button>
          <button
            onClick={() => setActiveTab('after')}
            style={{
              padding: '12px 20px',
              borderRadius: '50px',
              border: 'none',
              background: activeTab === 'after' ? '#1c1917' : 'transparent',
              color: activeTab === 'after' ? '#faf8f5' : '#57534e',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            {t.tabs.after}
          </button>
        </div>

        {/* 3 Step Flow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div style={{ background: '#f2eee9', padding: '32px 28px', borderRadius: '20px', border: '1px solid rgba(28,25,23,0.08)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', letterSpacing: '0.15em', marginBottom: '12px' }}>
              STEP 01
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1c1917', marginBottom: '10px' }}>
              {currentPhase.step1Title}
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#57534e', lineHeight: 1.6, margin: 0 }}>
              {currentPhase.step1Desc}
            </p>
          </div>

          <div style={{ background: '#f2eee9', padding: '32px 28px', borderRadius: '20px', border: '1px solid rgba(28,25,23,0.08)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', letterSpacing: '0.15em', marginBottom: '12px' }}>
              STEP 02
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1c1917', marginBottom: '10px' }}>
              {currentPhase.step2Title}
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#57534e', lineHeight: 1.6, margin: 0 }}>
              {currentPhase.step2Desc}
            </p>
          </div>

          <div style={{ background: '#f2eee9', padding: '32px 28px', borderRadius: '20px', border: '1px solid rgba(28,25,23,0.08)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', letterSpacing: '0.15em', marginBottom: '12px' }}>
              STEP 03
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1c1917', marginBottom: '10px' }}>
              {currentPhase.step3Title}
            </h4>
            <p style={{ fontSize: '0.92rem', color: '#57534e', lineHeight: 1.6, margin: 0 }}>
              {currentPhase.step3Desc}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

