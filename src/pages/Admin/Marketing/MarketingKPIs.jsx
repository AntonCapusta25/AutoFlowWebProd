import { KPI_DEFINITIONS, getLocalDateString } from './marketingUtils'

export default function MarketingKPIs({
  recordDate, setRecordDate, prevDay, nextDay, jumpToToday, isToday,
  actuals, setActuals, weeklySums, loading, saving,
  timeframe, setTimeframe, hoveredPoint, setHoveredPoint,
  svgPoints, pathD, areaD, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom,
  monday, sunday, dailyKpis, dailyTargetsHit, overallWeeklyPct,
  saveActual,
}) {
  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>
              Marketing KPIs
            </h1>
            <p style={{ color: '#64748B', margin: 0 }}>Daily KPI tracking with weekly aggregated targets</p>
          </div>

          {/* Date Selector & Calendar Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={prevDay}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: '#94A3B8', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  value={recordDate}
                  max={getLocalDateString()}
                  onChange={e => e.target.value && setRecordDate(e.target.value)}
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    color: 'white',
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    textAlign: 'center'
                  }}
                />
              </div>

              <button
                onClick={nextDay}
                disabled={isToday}
                style={{
                  background: isToday ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: isToday ? '#334155' : '#94A3B8', cursor: isToday ? 'default' : 'pointer', padding: '10px', display: 'flex', alignItems: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Week: {monday} to {sunday}</span>
              {!isToday && (
                <button
                  onClick={jumpToToday}
                  style={{
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '8px', color: '#34d399', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', cursor: 'pointer'
                  }}
                >
                  Back to Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Daily Target Checklist</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: dailyTargetsHit === dailyKpis.length ? '#10b981' : '#f59e0b' }}>
                {dailyTargetsHit} / {dailyKpis.length} Hit
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(dailyTargetsHit / dailyKpis.length) * 100}%`,
                borderRadius: '999px',
                background: dailyTargetsHit === dailyKpis.length
                  ? 'linear-gradient(90deg, #059669, #34d399)'
                  : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                transition: 'width 0.4s ease-out',
              }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#475569' }}>Number of daily targets hit on the selected date</p>
          </div>

          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Weekly Aggregate Score</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: overallWeeklyPct >= 80 ? '#10b981' : overallWeeklyPct >= 50 ? '#f59e0b' : '#d1bbfb' }}>
                {overallWeeklyPct}%
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${overallWeeklyPct}%`,
                borderRadius: '999px',
                background: overallWeeklyPct >= 80
                  ? 'linear-gradient(90deg, #059669, #34d399)'
                  : overallWeeklyPct >= 50
                    ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                    : 'linear-gradient(90deg, #d1bbfb, #d1bbfb)',
                transition: 'width 0.4s ease-out',
              }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#475569' }}>Completion percentage over the entire week (Mon-Sun)</p>
          </div>
        </div>
      </div>

      {/* KPI Completion Trend Graph */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>KPI Performance Trend</h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.75rem' }}>Average target achievement percentage over time</p>
          </div>
          
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button className={`tf-btn ${timeframe === 'daily' ? 'active' : ''}`} onClick={() => setTimeframe('daily')}>Daily</button>
            <button className={`tf-btn ${timeframe === 'weekly' ? 'active' : ''}`} onClick={() => setTimeframe('weekly')}>Weekly</button>
            <button className={`tf-btn ${timeframe === 'quarterly' ? 'active' : ''}`} onClick={() => setTimeframe('quarterly')}>Quarterly</button>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>Loading trend...</div>
          ) : (
            <div style={{ minWidth: '600px', position: 'relative' }}>
              {hoveredPoint && (
                <div style={{
                  position: 'absolute',
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${hoveredPoint.y - 45}px`,
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 10, 10, 0.95)',
                  border: '1px solid rgba(209, 187, 251, 0.4)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap'
                }}>
                  {hoveredPoint.tooltip}
                </div>
              )}

              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220px" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d1bbfb" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#5646e4" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d1bbfb"/>
                    <stop offset="100%" stopColor="#5646e4"/>
                  </linearGradient>
                </defs>

                {[0, 25, 50, 75, 100].map(val => {
                  const yVal = height - paddingBottom - (val / 100) * (height - paddingTop - paddingBottom)
                  return (
                    <g key={val}>
                      <line x1={paddingLeft} y1={yVal} x2={width - paddingRight} y2={yVal} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <text x={paddingLeft - 10} y={yVal + 4} fill="#475569" fontSize="10" fontWeight="700" textAnchor="end">{val}%</text>
                    </g>
                  )
                })}

                {svgPoints.map((p, idx) => (
                  <g key={idx}>
                    <line x1={p.x} y1={height - paddingBottom} x2={p.x} y2={height - paddingBottom + 5} stroke="rgba(255,255,255,0.15)" />
                    <text x={p.x} y={height - paddingBottom + 18} fill="#64748B" fontSize="9.5" fontWeight="700" textAnchor="middle">{p.label}</text>
                  </g>
                ))}

                {areaD && <path d={areaD} fill="url(#chartGradient)" />}
                {pathD && (
                  <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {svgPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    className="chart-circle"
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill={hoveredPoint && hoveredPoint.label === p.label ? 'white' : '#d1bbfb'}
                    stroke="#0a0a0a"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>Loading KPIs...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {KPI_DEFINITIONS.map(kpi => {
            const dayVal = actuals[kpi.id] ?? ''
            const dayValNum = parseInt(dayVal, 10) || 0
            const weekSum = weeklySums[kpi.id] || 0

            const isWeekly = kpi.period === 'weekly'
            const target = kpi.targetMax || kpi.target
            const kpiTargetWeekly = isWeekly ? target : target * 7

            const progressPct = Math.min(Math.round((dayValNum / target) * 100), 100)
            const weeklyProgressPct = Math.min(Math.round((weekSum / kpiTargetWeekly) * 100), 100)

            const isAchievedToday = dayValNum >= kpi.target
            const isOverToday = kpi.targetMax && dayValNum > kpi.targetMax

            return (
              <div
                key={kpi.id}
                className="kpi-card"
                style={{
                  background: '#0a0a0a',
                  border: `1px solid ${isAchievedToday && !isWeekly ? `rgba(209, 187, 251,0.25)` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: isAchievedToday && !isWeekly ? `0 0 30px rgba(209, 187, 251,0.15)` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '14px',
                      background: kpi.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      boxShadow: `0 4px 12px ${kpi.glow}`
                    }}>
                      {kpi.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem', lineHeight: 1.2 }}>{kpi.label}</span>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '6px',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: isWeekly ? 'rgba(59,130,246,0.1)' : 'rgba(209, 187, 251,0.08)',
                          color: isWeekly ? '#60a5fa' : '#f472b6'
                        }}>{kpi.period}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Target: {kpi.targetMax ? `${kpi.target}–${kpi.targetMax}` : kpi.target} {kpi.unit} / {isWeekly ? 'week' : 'day'}
                      </div>
                    </div>
                  </div>
                  {isAchievedToday && !isWeekly && (
                    <div style={{
                      background: isOverToday ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.15)',
                      color: isOverToday ? '#f97316' : '#34d399',
                      border: `1px solid ${isOverToday ? 'rgba(249,115,22,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      borderRadius: '20px', padding: '4px 10px',
                      fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {isOverToday ? '🔥 Over' : '✓ Done'}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!isWeekly && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Today's Target</span>
                        <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: 600 }}>{dayValNum} / {kpi.targetMax ? `${kpi.target}–${kpi.targetMax}` : kpi.target}</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: '999px', background: kpi.gradient, transition: 'width 0.4s ease-out' }} />
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{isWeekly ? 'Weekly Target' : 'Weekly Cumulative'}</span>
                      <span style={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: 600 }}>{weekSum} / {kpiTargetWeekly}</span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${weeklyProgressPct}%`, borderRadius: '999px', background: isWeekly ? kpi.gradient : 'linear-gradient(90deg, #334155, #64748b)', transition: 'width 0.4s ease-out' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      className="kpi-input"
                      type="number"
                      min="0"
                      value={dayVal}
                      onChange={e => setActuals(prev => ({ ...prev, [kpi.id]: e.target.value }))}
                      onBlur={e => saveActual(kpi.id, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveActual(kpi.id, e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        color: 'white', fontSize: '1.1rem', fontWeight: 700,
                        padding: '10px 16px', outline: 'none',
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}
                      onFocus={e => e.target.style.borderColor = kpi.color}
                      onBlurCapture={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: saving[kpi.id] ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                    border: saving[kpi.id] ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    {saving[kpi.id] ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p style={{ marginTop: '32px', color: '#334155', fontSize: '0.75rem', textAlign: 'center' }}>
        Values auto-save on blur or Enter · Input updates the value for the selected day · Weekly scores calculate Mon–Sun sums
      </p>
    </>
  )
}
