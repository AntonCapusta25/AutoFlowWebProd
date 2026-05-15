import { useState } from 'react'

export default function PriceCalculator() {
  const [open, setOpen] = useState(false)
  const [teamSize, setTeamSize] = useState('solo')
  const [numTasks, setNumTasks] = useState(1)
  const [complexity, setComplexity] = useState('simple')
  const [mgmt, setMgmt] = useState('background')
  const [support, setSupport] = useState(false)

  const complexityPrices = { simple: 100, smart: 250, advanced: 400 }
  const mgmtPrices = { background: 0, 'sheets-controls': 150, 'custom-dashboard': 350 }
  const supportPrices = { solo: 50, growing: 100, established: 200 }

  const oneTime = complexityPrices[complexity] * numTasks + mgmtPrices[mgmt]
  const monthly = support ? supportPrices[teamSize] : 0

  return (
    <>
      {/* FAB */}
      <div className="tools-fab-container" id="tools-fab-container">
        <div className="tools-menu" id="tools-menu" style={{display: open ? 'flex' : 'none'}}>
          <div className="tool-item" onClick={() => setOpen(false)} id="open-calculator-btn">
            <div className="tool-label">Price Calculator</div>
            <div className="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <line x1="8" y1="6" x2="16" y2="6"/><line x1="12" y1="10" x2="12" y2="18"/><line x1="8" y1="14" x2="16" y2="14"/>
              </svg>
            </div>
          </div>
        </div>
        <div id="main-fab" className="fab-icon" onClick={() => setOpen(o => !o)}>
          <svg className="main-fab-icon" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{display: open?'none':'block'}}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4"/>
            <line x1="12" y1="19" x2="12" y2="19.01"/>
          </svg>
          <svg className="main-fab-icon" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{display: open?'block':'none'}}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M18 6l-12 12"/><path d="M6 6l12 12"/>
          </svg>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="calculator-modal-overlay" style={{display:'flex'}} onClick={e => e.target===e.currentTarget && setOpen(false)}>
          <div className="calculator-modal">
            <button className="close-modal-btn" onClick={() => setOpen(false)}>×</button>
            <h2 style={{fontSize:'2rem',fontWeight:800,color:'#1a1a1a',margin:'0 0 10px',textAlign:'center'}}>Automation Price Estimator</h2>
            <p style={{color:'#6b7280',fontSize:'0.85rem',textAlign:'center',margin:'0 auto 25px',maxWidth:'450px'}}>
              Select your options to get a real-time price estimate.
            </p>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'25px'}}>
              <div>
                <label style={{display:'block',fontWeight:600,color:'#1a1a1a',marginBottom:'8px',fontSize:'0.95rem'}}>Team Size</label>
                <div className="custom-select">
                  <select value={teamSize} onChange={e=>setTeamSize(e.target.value)}>
                    <option value="solo">Small (1–5)</option>
                    <option value="growing">Medium (6–25)</option>
                    <option value="established">Large (26–99)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{display:'block',fontWeight:600,color:'#1a1a1a',marginBottom:'8px',fontSize:'0.95rem'}}>Number of Tasks</label>
                <input type="number" min="1" max="10" value={numTasks}
                  onChange={e=>setNumTasks(Math.max(1,parseInt(e.target.value)||1))}
                  style={{width:'100%',padding:'12px',border:'2px solid #e5e7eb',borderRadius:'8px',fontSize:'0.9rem',background:'#f8fafc',color:'#374151'}} />
              </div>
            </div>

            <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'#1a1a1a',margin:'0 0 15px'}}>Add-ons</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
              <div>
                <label style={{display:'block',fontWeight:600,color:'#1a1a1a',marginBottom:'8px',fontSize:'0.95rem'}}>Task Complexity</label>
                <div className="custom-select">
                  <select value={complexity} onChange={e=>setComplexity(e.target.value)}>
                    <option value="simple">Simple Syncs (€100/task)</option>
                    <option value="smart">Smart Workflows (€250/task)</option>
                    <option value="advanced">Advanced (€400/task)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{display:'block',fontWeight:600,color:'#1a1a1a',marginBottom:'8px',fontSize:'0.95rem'}}>Management Controls</label>
                <div className="custom-select">
                  <select value={mgmt} onChange={e=>setMgmt(e.target.value)}>
                    <option value="background">None (automatic)</option>
                    <option value="sheets-controls">Sheets Dashboard (+€150)</option>
                    <option value="custom-dashboard">Custom Dashboard (+€350)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{marginBottom:'25px'}}>
              <label style={{display:'flex',alignItems:'center',fontWeight:600,color:'#1a1a1a',cursor:'pointer',fontSize:'0.95rem',gap:'10px'}}>
                <input type="checkbox" checked={support} onChange={e=>setSupport(e.target.checked)}
                  style={{width:'18px',height:'18px',accentColor:'#e91e63'}} />
                Monthly support plan
              </label>
            </div>

            {/* Result */}
            <div style={{background:'linear-gradient(135deg,#fce4ec,#f3e5f5)',padding:'20px',borderRadius:'15px',textAlign:'center'}}>
              <div style={{color:'#9ca3af',fontSize:'0.8rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'8px'}}>ESTIMATED TOTAL</div>
              <div style={{fontSize:'2.5rem',fontWeight:800,background:'linear-gradient(135deg,#e91e63,#9c27b0)',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>
                €{oneTime.toLocaleString()}
              </div>
              <div style={{color:'#6b7280',fontSize:'0.8rem',marginBottom:'8px'}}>(One-Time Project Cost)</div>
              {support && (
                <div style={{marginBottom:'12px'}}>
                  <div style={{fontSize:'1.25rem',fontWeight:'bold',color:'#e91e63'}}>+ €{monthly}/month</div>
                  <div style={{color:'#6b7280',fontSize:'0.8rem'}}>(Monthly Support Plan)</div>
                </div>
              )}
              <p style={{color:'#9ca3af',fontSize:'0.8rem',lineHeight:1.4,margin:'0 0 16px',maxWidth:'350px',marginLeft:'auto',marginRight:'auto'}}>
                Rough estimate — final price depends on your specific requirements.
              </p>
              <a href="https://calendar.app.google/bnsr9k5VHi5EYgdM8" target="_blank" rel="noreferrer"
                style={{display:'inline-block',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',padding:'12px 30px',borderRadius:'50px',textDecoration:'none',fontWeight:600,fontSize:'0.95rem',boxShadow:'0 8px 25px rgba(233,30,99,0.3)'}}>
                Schedule a free consultation
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
