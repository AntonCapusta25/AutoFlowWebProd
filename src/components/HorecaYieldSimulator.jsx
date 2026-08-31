import React, { useState } from 'react'

export default function HorecaYieldSimulator({ lang = 'en' }) {
  const [activeArea, setActiveArea] = useState('main')

  const areas = {
    main: {
      name: lang === 'nl' ? 'Hoofdzaal (12 Tafels)' : 'Main Dining Room (12 Tables)',
      covers: '48 Covers',
      occupancy: '92%',
      turnTime: '1h 45m',
      tables: [
        { id: 'T1', name: 'Table 01', pax: '4 Pax', status: 'occupied', timer: '35m left', guest: 'Sophie Hermans', note: 'VIP · Barolo lover' },
        { id: 'T2', name: 'Table 02', pax: '2 Pax', status: 'confirmed', timer: 'Starts 19:30', guest: 'Lars van Dijk', note: '€30 Deposit Verified' },
        { id: 'T3', name: 'Table 03', pax: '6 Pax', status: 'occupied', timer: '10m left', guest: 'Daan & Party', note: 'Desserts serving' },
        { id: 'T4', name: 'Table 04', pax: '4 Pax', status: 'available', timer: 'Ready', guest: 'Empty', note: 'Auto-released via SMS' },
        { id: 'T5', name: 'Table 05', pax: '2 Pax', status: 'occupied', timer: '50m left', guest: 'Emma de Jong', note: 'Anniversary' },
        { id: 'T6', name: 'Table 06', pax: '8 Pax', status: 'confirmed', timer: 'Starts 20:00', guest: 'B2B Dinner', note: 'Pre-paid Tasting Menu' }
      ],
      metrics: {
        savings: '€3,450',
        turns: '+42%',
        noShowRecaptured: '88%'
      }
    },
    terrace: {
      name: lang === 'nl' ? 'Verwarmd Terras (8 Tafels)' : 'Heated Terrace (8 Tables)',
      covers: '32 Covers',
      occupancy: '85%',
      turnTime: '1h 20m',
      tables: [
        { id: 'TR1', name: 'Terrace 01', pax: '4 Pax', status: 'occupied', timer: '20m left', guest: 'Klaas Bakker', note: 'Cocktail Package' },
        { id: 'TR2', name: 'Terrace 02', pax: '2 Pax', status: 'available', timer: 'Ready', guest: 'Empty', note: 'Walk-in ready' },
        { id: 'TR3', name: 'Terrace 03', pax: '4 Pax', status: 'confirmed', timer: 'Starts 19:45', guest: 'Mark & Friends', note: 'Deposit Verified' },
        { id: 'TR4', name: 'Terrace 04', pax: '6 Pax', status: 'occupied', timer: '40m left', guest: 'Company Drinks', note: 'POS Tab Active' }
      ],
      metrics: {
        savings: '€2,180',
        turns: '+55%',
        noShowRecaptured: '94%'
      }
    },
    lounge: {
      name: lang === 'nl' ? 'Private Dining Lounge' : 'Private Dining Lounge',
      covers: '16 Covers',
      occupancy: '100%',
      turnTime: '2h 30m',
      tables: [
        { id: 'L1', name: 'Lounge Suite A', pax: '10 Pax', status: 'confirmed', timer: 'Starts 20:00', guest: 'Executive Board', note: '€250 Pre-Paid' },
        { id: 'L2', name: 'Chef Table', pax: '6 Pax', status: 'occupied', timer: '60m left', guest: 'Gourmet Tasting', note: 'Wine Pairing' }
      ],
      metrics: {
        savings: '€4,800',
        turns: '+25%',
        noShowRecaptured: '100%'
      }
    }
  }

  const current = areas[activeArea]

  return (
    <div style={{ background: '#eae6df', borderRadius: '32px', padding: '12px', border: '1px solid rgba(28,25,23,0.1)' }}>
      <div style={{ background: '#faf8f5', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px -15px rgba(28,25,23,0.05)' }}>
        
        {/* Header & Area Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '36px', borderBottom: '1px solid rgba(28,25,23,0.08)', paddingBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#991b1b', display: 'block', marginBottom: '6px' }}>
              02 / {lang === 'nl' ? 'LIVE TAFELBEZETTING & YIELD PACING' : 'LIVE FLOOR PLAN & YIELD PACING'}
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 400, color: '#1c1917', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', margin: 0 }}>
              {current.name}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#e7e3dc', padding: '6px', borderRadius: '50px', border: '1px solid rgba(28,25,23,0.08)' }}>
            <button 
              onClick={() => setActiveArea('main')}
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                border: 'none',
                background: activeArea === 'main' ? '#1c1917' : 'transparent',
                color: activeArea === 'main' ? '#faf8f5' : '#57534e',
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              {lang === 'nl' ? 'Hoofdzaal' : 'Main Room'}
            </button>
            <button 
              onClick={() => setActiveArea('terrace')}
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                border: 'none',
                background: activeArea === 'terrace' ? '#1c1917' : 'transparent',
                color: activeArea === 'terrace' ? '#faf8f5' : '#57534e',
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              Terras
            </button>
            <button 
              onClick={() => setActiveArea('lounge')}
              style={{
                padding: '10px 22px',
                borderRadius: '50px',
                border: 'none',
                background: activeArea === 'lounge' ? '#1c1917' : 'transparent',
                color: activeArea === 'lounge' ? '#faf8f5' : '#57534e',
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              Lounge
            </button>
          </div>
        </div>

        {/* Visual Table Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '36px' }}>
          {current.tables.map((table) => {
            const isOccupied = table.status === 'occupied'
            const isConfirmed = table.status === 'confirmed'

            return (
              <div 
                key={table.id}
                style={{
                  background: isOccupied ? '#f2eee9' : isConfirmed ? '#eef7f2' : '#ffffff',
                  border: isOccupied ? '1px solid rgba(28,25,23,0.15)' : isConfirmed ? '1px solid rgba(16,185,129,0.3)' : '1px dashed rgba(168,162,158,0.5)',
                  borderRadius: '20px',
                  padding: '22px',
                  transition: '0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#1c1917', fontSize: '1rem', letterSpacing: '-0.01em' }}>{table.name}</span>
                  <span 
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '50px',
                      background: isOccupied ? '#1c1917' : isConfirmed ? '#10b981' : '#e7e5e4',
                      color: isOccupied || isConfirmed ? '#ffffff' : '#57534e'
                    }}
                  >
                    {table.pax}
                  </span>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#292524', fontWeight: 600, marginBottom: '6px' }}>
                  {table.guest}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78716c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{table.note}</span>
                  <strong style={{ color: isOccupied ? '#991b1b' : isConfirmed ? '#047857' : '#78716c' }}>{table.timer}</strong>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Yield Metrics Banner */}
        <div style={{ background: '#1c1917', borderRadius: '20px', padding: '28px 32px', color: '#faf8f5', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
              {lang === 'nl' ? 'COMMISSIEVRIJE BESPARING' : 'MONTHLY FEES SAVED'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 400, color: '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>{current.metrics.savings} / mo</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
              {lang === 'nl' ? 'TAFELBEZETTING MULTIPLICATOR' : 'TABLE TURN MULTIPLIER'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 400, color: '#38bdf8', fontFamily: "'Space Grotesk', sans-serif" }}>{current.metrics.turns} Faster</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
              {lang === 'nl' ? 'HEROVERDE NO-SHOW OMZET' : 'NO-SHOW RECAPTURED'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 400, color: '#fca5a5', fontFamily: "'Space Grotesk', sans-serif" }}>{current.metrics.noShowRecaptured} Recovered</div>
          </div>
        </div>

      </div>
    </div>
  )
}

