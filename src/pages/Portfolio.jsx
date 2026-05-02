import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const PROJECTS = [
  { slug:'project-1', title:'Custom Photo Improvement Tool', desc:'Automated photo enhancement ensuring every chef\'s dish looks magazine-ready on the platform.', stats:'20h saved/week • 5X faster onboarding • €45k/yr savings' },
  { slug:'project-2', title:'AI-Powered Chatbot with Telegram', desc:'AI chatbot providing instant 24/7 customer support via Telegram, connected to live data.', stats:'70% inquiries automated • 35h saved/week • €40K+ savings' },
  { slug:'project-3', title:'AI-Powered Precision Lead Scraping', desc:'Automated lead qualification system scoring prospects and routing high-value leads to sales.', stats:'5-7X lead volume • 30h saved/week • €55K+ savings' },
  { slug:'project-4', title:'Hyper-Personalised Outreach Engine', desc:'AI system generating thousands of personalised, human-sounding outreach emails.', stats:'10X outreach volume • 95% personalisation • €60K+ savings' },
]

export default function Portfolio() {
  useEffect(() => {
    document.title = 'Portfolio - AutoFlow Studio'
  }, [])

  return (
    <main className="main-content">
      <section className="blog-header">
        <div className="hero-background">
          <div className="abstract-element sphere-1" />
          <div className="abstract-element sphere-2" />
        </div>
        <div className="container">
          <h1>Our Work</h1>
          <p>Real automation projects with measurable results for real businesses.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'32px',marginTop:'20px'}}>
            {PROJECTS.map((p,i) => (
              <div key={i} className="portfolio-card" style={{background:'white',borderRadius:'20px',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.08)',transition:'transform 0.3s,box-shadow 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}}>
                <div style={{padding:'32px'}}>
                  <div style={{display:'inline-block',background:'linear-gradient(135deg,#e91e63,#9c27b0)',color:'white',fontSize:'0.75rem',fontWeight:700,padding:'4px 12px',borderRadius:'20px',marginBottom:'16px',letterSpacing:'0.05em'}}>
                    CASE STUDY
                  </div>
                  <h3 style={{color:'#1a1a1a',fontSize:'1.25rem',fontWeight:700,marginBottom:'12px',lineHeight:1.3}}>{p.title}</h3>
                  <p style={{color:'#6b7280',lineHeight:1.6,marginBottom:'20px'}}>{p.desc}</p>
                  <p style={{color:'#e91e63',fontWeight:600,fontSize:'0.85rem',marginBottom:'24px'}}>{p.stats}</p>
                  <Link to={`/${p.slug}`} className="cta-button" style={{display:'inline-block',padding:'12px 24px',fontSize:'0.9rem'}}>
                    View Case Study
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
