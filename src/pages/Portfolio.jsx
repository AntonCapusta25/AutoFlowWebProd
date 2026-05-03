import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from '../data/projectsData'
import { getT } from '../i18n/translations'
import CTASection from '../components/CTASection'

export default function Portfolio({ lang = 'en' }) {
  useEffect(() => { 
    document.title = (lang === 'nl' ? 'Portfolio' : 'Portfolio') + ' - AutoFlow Studio' 
    window.scrollTo(0, 0)
  }, [lang])

  const t = getT(lang).portfolio
  const isNl = lang === 'nl'

  return (
    <main className="main-content" style={{ background: '#050505' }}>
      {/* Header */}
      <section style={{
        paddingTop: '140px', paddingBottom: '60px', textAlign: 'center',
        background: 'linear-gradient(180deg,#050505 0%,#0a0a0a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute',top:'20%',right:'10%',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(156,39,176,0.07) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ maxWidth:'700px',margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1 }}>
          <span style={{ display:'inline-block',background:'rgba(233,30,99,0.12)',border:'1px solid rgba(233,30,99,0.3)',color:'#e91e63',padding:'6px 18px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'20px' }}>
            {t.badge}
          </span>
          <h1 style={{ color:'#F8FAFC',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,marginBottom:'16px',lineHeight:1.15 }}>
            {t.title}
          </h1>
          <p style={{ color:'#94A3B8',fontSize:'1.05rem',lineHeight:1.7,maxWidth:'500px',margin:'0 auto' }}>
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Cards */}
      <section style={{ background:'#050505',padding:'60px 24px 100px' }}>
        <div style={{ maxWidth:'1200px',margin:'0 auto' }}>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(520px,1fr))',gap:'28px' }} className="portfolio-grid">
            {PROJECTS.map((p, i) => {
              const projectTitle = isNl && p.titleNL ? p.titleNL : p.title
              const projectSubtitle = isNl && p.overviewNL ? p.overviewNL : p.subtitle
              const projectStats = isNl && p.statsNL ? p.statsNL : p.stats
              const projectSlug = isNl ? `/nl/projects/${p.slug}` : `/projects/${p.slug}`

              return (
                <div key={i} style={{
                  background:'#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px', 
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)',
                  transition:'transform 0.25s,box-shadow 0.25s,border-color 0.25s',
                  display:'flex', flexDirection:'column',
                }}
                  onMouseOver={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 20px rgba(255,255,255,0.25), 0 40px 80px rgba(0,0,0,0.9)';e.currentTarget.style.borderColor='rgba(233,30,99,0.3)'}}
                  onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 20px rgba(255,255,255,0.15), 0 30px 60px rgba(0,0,0,0.8)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
                  {/* top bar */}
                  <div style={{ height:'4px',background:'linear-gradient(90deg,#e91e63,#9c27b0)' }} />
                  <div style={{ padding:'32px',flex:1,display:'flex',flexDirection:'column' }}>
                    <div style={{ display:'inline-block',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',fontSize:'0.75rem',fontWeight:700,padding:'4px 12px',borderRadius:'20px',marginBottom:'16px',letterSpacing:'0.05em',alignSelf:'flex-start' }}>
                      {t.caseStudy}
                    </div>
                    <h2 style={{ color:'#F8FAFC',fontSize:'1.25rem',fontWeight:700,marginBottom:'12px',lineHeight:1.35 }}>{projectTitle}</h2>
                    <p style={{ color:'#94A3B8',lineHeight:1.65,marginBottom:'24px',fontSize:'0.9rem',flex:1 }}>{projectSubtitle}</p>

                    {/* Stats row */}
                    <div style={{ display:'flex',gap:'20px',marginBottom:'28px',padding:'16px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.05)',overflowX:'auto' }}>
                      {projectStats.slice(0, 3).map((s, j) => (
                        <div key={j} style={{ minWidth:'fit-content' }}>
                          <div style={{ color:'#F8FAFC',fontWeight:800,fontSize:'1.1rem',background:'linear-gradient(135deg,#e91e63,#9c27b0)',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent' }}>{s.value}</div>
                          <div style={{ color:'#64748B',fontSize:'0.7rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em' }}>{s.label.split(' ')[0]}</div>
                        </div>
                      ))}
                    </div>

                    <Link to={projectSlug} className="cta-button" style={{ alignSelf:'flex-start',padding:'12px 24px',fontSize:'0.875rem' }}>
                      {t.viewCase}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <CTASection lang={lang} />
      <style>{`@media(max-width:600px){.portfolio-grid{grid-template-columns:1fr!important;}}`}</style>
    </main>
  )
}
