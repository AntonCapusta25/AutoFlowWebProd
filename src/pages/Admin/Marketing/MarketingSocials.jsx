import { useState } from 'react'

export default function MarketingSocials({
  recordDate, weeklySums, kpiTargets, updateKpiTarget,
  fbToken,
  connectedPage, connectedInstagram,
  isSyncing, syncSuccess,
  handleConnectFacebook, handleDisconnectFacebook, handleSyncMetrics,
}) {
  const [localAppId, setLocalAppId] = useState(localStorage.getItem('meta_app_id') || '')
  const resolvedAppId = import.meta.env.VITE_META_APP_ID || localAppId

  const onConnect = () => {
    if (localAppId) localStorage.setItem('meta_app_id', localAppId)
    handleConnectFacebook(resolvedAppId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'white' }}>
            Social Performance &amp; Target Monitor
          </h2>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Track live metrics, set weekly targets, and sync Instagram &amp; LinkedIn data
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSyncMetrics}
            disabled={isSyncing}
            style={{
              background: isSyncing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px',
              fontSize: '0.85rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(168,85,247,0.2)',
              transition: 'opacity 0.2s, transform 0.2s', outline: 'none'
            }}
          >
            {isSyncing ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" strokeDasharray="32" /></svg>
                Syncing...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.57.57" /></svg>
                Sync Live Metrics
              </>
            )}
          </button>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Week of: </span>
            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{recordDate}</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* LEFT: KPI Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Instagram */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#E1306C' }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>Instagram Weekly KPIs</span>
            </div>

            {[
              { id: 'instagram_views', label: 'Views', icon: '👁', gradient: 'linear-gradient(90deg,#833ab4,#fd1d1d)' },
              { id: 'instagram_likes', label: 'Likes', icon: '❤️', gradient: 'linear-gradient(90deg,#fd1d1d,#fcb045)' },
              { id: 'instagram_posts', label: 'Posts', icon: '📸', gradient: 'linear-gradient(90deg,#fcb045,#e1306c)' },
            ].map(kpi => {
              const actual = weeklySums[kpi.id] || 0
              const target = kpiTargets[kpi.id] || (kpi.id === 'instagram_posts' ? 7 : 0)
              const pct = target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0
              return (
                <div key={kpi.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>{kpi.icon} {kpi.label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{actual.toLocaleString()} / {target.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: kpi.gradient, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>{pct}% of weekly target</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#475569' }}>Target:</span>
                      <input
                        type="number" value={kpiTargets[kpi.id] ?? ''}
                        onChange={e => updateKpiTarget(kpi.id, e.target.value)}
                        style={{ width: '70px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#94a3b8', padding: '2px 6px', fontSize: '0.7rem', outline: 'none', textAlign: 'right' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* LinkedIn */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0077B5' }}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>LinkedIn Weekly KPIs</span>
            </div>

            {[
              { id: 'linkedin_views', label: 'Views', icon: '👁', gradient: 'linear-gradient(90deg,#0077B5,#00a0dc)' },
              { id: 'linkedin_likes', label: 'Likes', icon: '👍', gradient: 'linear-gradient(90deg,#00a0dc,#0099cc)' },
              { id: 'linkedin_reposts', label: 'Reposts', icon: '🔁', gradient: 'linear-gradient(90deg,#005582,#0077B5)' },
            ].map(kpi => {
              const actual = weeklySums[kpi.id] || 0
              const target = kpiTargets[kpi.id] || 0
              const pct = target > 0 ? Math.min(Math.round((actual / target) * 100), 100) : 0
              return (
                <div key={kpi.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>{kpi.icon} {kpi.label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{actual.toLocaleString()} / {target.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: kpi.gradient, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>{pct}% of weekly target</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#475569' }}>Target:</span>
                      <input
                        type="number" value={kpiTargets[kpi.id] ?? ''}
                        onChange={e => updateKpiTarget(kpi.id, e.target.value)}
                        style={{ width: '70px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#94a3b8', padding: '2px 6px', fontSize: '0.7rem', outline: 'none', textAlign: 'right' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Channel Integrations + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1rem', fontWeight: 700 }}>Channel Integrations</h3>
            <p style={{ color: '#64748B', fontSize: '0.82rem', margin: '0 0 24px 0' }}>
              Connect your Meta Business account to sync live Instagram performance metrics directly into your KPI tracker.
            </p>


            {/* Connection status row */}
            <div style={{ background: fbToken ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${fbToken ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: fbToken ? '#4ade80' : '#64748B', marginBottom: '2px' }}>
                  {fbToken ? '● Connected' : '○ Not Connected'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  {connectedInstagram ? `@${connectedInstagram}` : connectedPage ? connectedPage : 'Facebook / Instagram'}
                </div>
              </div>
              {fbToken ? (
                <button onClick={handleDisconnectFacebook} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  Disconnect
                </button>
              ) : resolvedAppId ? (
                <button onClick={onConnect} style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #1877f2, #0a5ebd)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Login with Facebook
                </button>
              ) : (
                <span style={{ fontSize: '0.7rem', color: '#475569' }}>Enter App ID below ↓</span>
              )}
            </div>

            {/* One-time App ID setup — only visible when no ID is known and not connected */}
            {!fbToken && !resolvedAppId && (
              <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={localAppId}
                  onChange={e => setLocalAppId(e.target.value)}
                  placeholder="Paste Meta App ID here..."
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                />
                <button
                  onClick={onConnect}
                  disabled={!localAppId.trim()}
                  style={{ padding: '10px 16px', background: localAppId.trim() ? 'linear-gradient(135deg, #1877f2, #0a5ebd)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: localAppId.trim() ? 'white' : '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: localAppId.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Connect
                </button>
              </div>
            )}

            <div style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: 700, margin: '0 0 8px 0' }}>How to connect:</p>
              <ol style={{ color: '#64748B', fontSize: '0.78rem', margin: 0, paddingLeft: '18px', lineHeight: '1.7' }}>
                <li>Create a Meta Developer App at developers.facebook.com</li>
                <li>Add Facebook Login + Instagram Graph API use cases</li>
                <li>Paste your App ID in the field above and click Connect</li>
                <li>After login, click Sync Live Metrics to import data</li>
              </ol>
            </div>

            {syncSuccess && (
              <div style={{ marginTop: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>
                ✓ Last sync successful! KPIs updated.
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1rem', fontWeight: 700 }}>This Week At a Glance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'IG Views', value: (weeklySums['instagram_views'] || 0).toLocaleString(), color: '#E1306C' },
                { label: 'IG Likes', value: (weeklySums['instagram_likes'] || 0).toLocaleString(), color: '#fd1d1d' },
                { label: 'LI Views', value: (weeklySums['linkedin_views'] || 0).toLocaleString(), color: '#0077B5' },
                { label: 'LI Likes', value: (weeklySums['linkedin_likes'] || 0).toLocaleString(), color: '#00a0dc' },
                { label: 'LI Reposts', value: (weeklySums['linkedin_reposts'] || 0).toLocaleString(), color: '#005582' },
                { label: 'IG Posts', value: (weeklySums['instagram_posts'] || 0).toLocaleString(), color: '#fcb045' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
