import { useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PROJECTS } from '../data/projectsData'
import { getT } from '../i18n/translations'
import CTASection from '../components/CTASection'

export default function ProjectDetail({ lang = 'en' }) {
  const { slug } = useParams()
  const project = useMemo(() => PROJECTS.find(p => p.slug === slug), [slug])

  const trans = getT(lang)
  const isNl = lang === 'nl'
  const t = trans.common

  // Get translated fields with fallback to English
  const title = isNl && project?.titleNL ? project.titleNL : project?.title
  const subtitle = isNl && project?.subtitleNL ? project.subtitleNL : project?.subtitle
  const stats = isNl && project?.statsNL ? project.statsNL : project?.stats
  const content = isNl && project?.contentNL ? project.contentNL : project?.content
  const backLink = isNl ? '/nl/portfolio' : '/portfolio'

  useEffect(() => {
    if (project) {
      document.title = `${title} - AutoFlow Studio`
      window.scrollTo(0, 0)
    }
  }, [project, title])

  if (!project) return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isNl ? 'Project niet gevonden' : 'Project not found'}
    </div>
  )

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 2px 20px rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.4)',
    padding: '40px'
  }

  return (
    <main style={{ background: '#050505', color: '#F8FAFC', minHeight: '100vh', padding: '120px 20px 80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation */}
        <Link to={backLink} style={{ display: 'inline-flex', alignItems: 'center', color: '#94A3B8', textDecoration: 'none', marginBottom: '40px', fontSize: '0.9rem', transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = '#e91e63'}
          onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>
          {t.backToPortfolio}
        </Link>

        {/* Header */}
        <header style={{ marginBottom: '60px', maxWidth: '1000px' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '100px', background: 'rgba(233, 30, 99, 0.1)', border: '1px solid rgba(233, 30, 99, 0.2)', color: '#e91e63', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '24px' }}>
            {project.category.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(to bottom, #FFFFFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '800px' }}>
            {subtitle}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginTop: '40px', padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.client}</div>
              <div style={{ fontWeight: 600 }}>{project.client}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.industry}</div>
              <div style={{ fontWeight: 600 }}>{project.industry}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.location}</div>
              <div style={{ fontWeight: 600 }}>{project.location}</div>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div style={{ borderRadius: '32px', overflow: 'hidden', marginBottom: '80px', boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <img src={project.heroImage} alt={title} style={{ width: '100%', display: 'block' }} />
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '60px' }}>
          
          {/* Article Body */}
          <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '60px', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)' }}>
            <div style={{ color: '#CBD5E1', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {content ? content.map((block, i) => {
                switch(block.type) {
                  case 'heading':
                    const Tag = block.level === 3 ? 'h3' : 'h2'
                    return <Tag key={i} style={{ color: '#F8FAFC', fontSize: block.level === 3 ? '1.5rem' : '2.25rem', fontWeight: 800, marginTop: '48px', marginBottom: '24px', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{block.text}</Tag>
                  case 'paragraph':
                    return <p key={i} style={{ marginBottom: '24px' }}>{block.text}</p>
                  case 'list':
                    return (
                      <ul key={i} style={{ marginBottom: '32px', paddingLeft: '20px', listStyleType: 'none' }}>
                        {block.items.map((item, j) => (
                          <li key={j} style={{ marginBottom: '12px', position: 'relative', paddingLeft: '24px' }}>
                            <span style={{ position: 'absolute', left: 0, color: '#e91e63', fontWeight: 900 }}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )
                  case 'box':
                    return (
                      <div key={i} style={{ background: 'rgba(233, 30, 99, 0.05)', borderLeft: '4px solid #e91e63', padding: '32px', borderRadius: '0 16px 16px 0', margin: '40px 0' }}>
                        <h4 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{block.title}</h4>
                        <p style={{ margin: 0, fontSize: '1.05rem', color: '#CBD5E1' }}>{block.content}</p>
                      </div>
                    )
                  case 'testimonial':
                    return (
                      <blockquote key={i} style={{ margin: '60px 0', padding: '48px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '6rem', color: '#e91e63', opacity: 0.1, fontFamily: 'serif', lineHeight: 1 }}>"</div>
                        <p style={{ fontStyle: 'italic', fontSize: '1.4rem', color: '#F8FAFC', marginBottom: '24px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>{block.quote}</p>
                        <cite style={{ display: 'block', fontWeight: 700, color: '#94A3B8', fontStyle: 'normal', fontSize: '1.1rem' }}>— {block.author}</cite>
                      </blockquote>
                    )
                  default: return null
                }
              }) : <p>{isNl ? 'Gedetailleerde case study volgt binnenkort...' : 'Detailed case study content coming soon...'}</p>}
            </div>

            <CTASection lang={lang} />
          </div>

          {/* Sidebar - Stats & Info */}
          <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={glassStyle}>
              <h3 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span> {t.keyResults}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ color: '#e91e63', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1.2 }}>{s.value}</div>
                    <div style={{ color: '#CBD5E1', fontSize: '0.95rem', fontWeight: 700, marginTop: '4px' }}>{s.label}</div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px', lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...glassStyle, marginTop: '30px' }}>
              <h3 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>🛠️</span> {t.coreStack}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {project.tools.map((t, i) => (
                  <span key={i} style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50px', fontSize: '0.8rem', color: '#CBD5E1', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ ...glassStyle, marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, rgba(233,30,99,0.05) 0%, rgba(156,39,176,0.05) 100%)', textAlign: 'center' }}>
              <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '1rem' }}>{t.questions}</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '20px' }}>{t.helpText}</p>
              <Link to={isNl ? '/nl/contact' : '/contact'} style={{ color: '#e91e63', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>{t.contactUs}</Link>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
