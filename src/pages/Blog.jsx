import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const POSTS = [
  { slug:'10-repetitive-tasks', title:'10 Repetitive Tasks You Should Automate Today', date:'March 2026', excerpt:'Discover the most common time-wasting tasks that can be automated to save your team hours every week.' },
  { slug:'5-ways-to-customer', title:'5 Ways Automation Improves Customer Experience', date:'February 2026', excerpt:'Learn how smart automation can transform customer interactions and boost satisfaction scores.' },
  { slug:'bpa-guide', title:'The Complete BPA Guide for SMEs', date:'January 2026', excerpt:'Everything small and medium businesses need to know about Business Process Automation.' },
  { slug:'zapier-vs-custom', title:'Zapier vs Custom Automation — Which Is Right for You?', date:'January 2026', excerpt:'A no-nonsense comparison to help you choose the right automation approach for your business.' },
  { slug:'automation-intro', title:'Introduction to Business Automation', date:'December 2025', excerpt:'Start here if you\'re new to automation. A beginner-friendly overview of what automation can do for your business.' },
  { slug:'outgrown-zapier', title:'Signs You\'ve Outgrown Zapier', date:'December 2025', excerpt:'Are your workflows becoming too complex? Here are the signs it\'s time to move beyond no-code tools.' },
]

export default function Blog() {
  useEffect(() => {
    document.title = 'Blog - AutoFlow Studio'
  }, [])

  return (
    <main className="main-content">
      <section className="blog-header">
        <div className="hero-background">
          <div className="abstract-element sphere-1" />
          <div className="abstract-element sphere-2" />
        </div>
        <div className="container">
          <h1>Automation Insights</h1>
          <p>Practical guides, case studies, and tips to help you automate smarter.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'32px',marginTop:'20px'}}>
            {POSTS.map((p,i) => (
              <article key={i} className="blog-card" style={{background:'white',borderRadius:'20px',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.08)',transition:'transform 0.3s,box-shadow 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}}>
                <div style={{padding:'32px'}}>
                  <span style={{color:'#94A3B8',fontSize:'0.8rem',fontWeight:600,display:'block',marginBottom:'10px'}}>{p.date}</span>
                  <h2 style={{color:'#1a1a1a',fontSize:'1.15rem',fontWeight:700,marginBottom:'12px',lineHeight:1.35}}>{p.title}</h2>
                  <p style={{color:'#6b7280',lineHeight:1.6,marginBottom:'24px',fontSize:'0.9rem'}}>{p.excerpt}</p>
                  <Link to={`/blog/${p.slug}`}
                    style={{color:'#e91e63',fontWeight:600,fontSize:'0.875rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px'}}>
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
