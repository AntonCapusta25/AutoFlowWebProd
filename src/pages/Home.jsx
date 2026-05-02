import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import BookingForm from '../components/BookingForm'

const LOGOS = ['Google Sheets','Make.com','Zapier','OpenAI','Supabase','Airtable','n8n','Claude AI','Vercel','Netlify']

const CAROUSEL_SLIDES = [
  {
    videoId: 'b467PfZsSXQ',
    videoTitle: 'Custom Photo Improvement Tool',
    videoDesc: 'Automated photo enhancement ensuring every chef\'s dish looks magazine-ready.',
    title: 'Visual Consistency Revolution',
    desc: 'Transformed inconsistent food photos into professional images, making the platform visually competitive.',
    stats: [{ n:'20', l:'Hours Saved Weekly' },{ n:'5X', l:'Faster Onboarding' },{ n:'3', l:'Minutes Processing' },{ n:'€45k', l:'Annual Savings' }],
    href: '/projects/project-1',
  },
  {
    videoId: 'yTDTiJZXJ3M',
    videoTitle: 'AI-Powered Personalized Email Automation',
    videoDesc: 'AI system generating thousands of personalised, human-sounding emails.',
    title: 'Hyper-Personalised Outreach Engine',
    desc: 'Automated creation of highly personalised sales emails enabling massive outreach volume with human touch.',
    stats: [{ n:'10X', l:'Outreach Volume' },{ n:'95%', l:'Personalisation Score' },{ n:'3', l:'Hours Saved Daily' },{ n:'€60K+', l:'Annual Savings' }],
    href: '/projects/project-4',
  },
  {
    videoId: 'Rg1Kb2y2BiY',
    videoTitle: 'AI-Powered Chatbot with Telegram Integration',
    videoDesc: 'AI chatbot providing instant 24/7 customer support via Telegram.',
    title: '24/7 Instant Customer Support',
    desc: 'Intelligent chatbot with real-time Telegram integration answering queries instantly.',
    stats: [{ n:'70%', l:'Inquiries Automated' },{ n:'Real-time', l:'Answers' },{ n:'35', l:'Hours Saved Weekly' },{ n:'€40K+', l:'Annual Savings' }],
    href: '/projects/project-2',
  },
  {
    videoId: 'KjOoXLNfWlA',
    videoTitle: 'Data Goldmine Automation',
    videoDesc: 'Automated lead generation engine scraping and enriching prospect data.',
    title: 'AI-Powered Precision Lead Scraping',
    desc: 'Automated lead qualification that scores prospects, sends personalised follow-ups, and routes high-value leads to sales.',
    stats: [{ n:'5-7X', l:'Lead Volume' },{ n:'30', l:'Hours Saved Weekly' },{ n:'85%', l:'Lead Quality Score' },{ n:'€55K+', l:'Annual Savings' }],
    href: '/projects/project-3',
  },
]

export default function Home() {
  const trackRef = useRef(null)
  const currentRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    document.title = 'AutoFlow Studio - Automate the Work You Hate'
  }, [])

  const goTo = (idx) => {
    currentRef.current = idx
    if (trackRef.current) trackRef.current.style.transform = `translateX(-${idx * 100}%)`
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % CAROUSEL_SLIDES.length
      goTo(next)
    }, 6000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <main className="main-content">
      {/* Hero */}
      <section className="hero hero-section">
        <div className="hero-container-new">
          <div className="hero-content-grid">
            <div className="hero-text-new">
              <h1>Automate the Work You Hate</h1>
              <p>Custom automation tools for startups, founders, and teams. From Google Sheets workflows to AI chatbots — delivered in under 7 days.</p>
              <a href="https://autoflow.neetocal.com/meeting-with-auto-flow" className="cta-button-new" target="_blank" rel="noreferrer"
                style={{background:'linear-gradient(135deg,#e91e63,#9c27b0)',border:'none',boxShadow:'0 8px 32px rgba(233,30,99,0.3)',color:'white'}}>
                Book Free Audit
              </a>
            </div>
            <div className="hero-right-new">
              <div className="hero-video-card" style={{background:'transparent',boxShadow:'none',border:'none'}}>
                <div className="video-aspect-wrapper" style={{background:'transparent'}}>
                  <img src="/images/hero-automation.svg" alt="AutoFlow Studio automation illustration"
                    style={{width:'100%',height:'100%',objectFit:'contain',position:'absolute',left:0,top:0}} />
                </div>
              </div>
            </div>
          </div>

          {/* Logo carousel */}
          <div className="logos-section">
            <div className="logos-label">Trusted Tools &amp; Happy Clients</div>
            <div className="logos-track-container">
              <div className="logos-track">
                {[...LOGOS,...LOGOS].map((l,i) => (
                  <div key={i} className="logo-item"><div className="logo-placeholder">{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="horizontal-scroll-section" id="what-we-build">
        <div className="section-header-sticky">
          <h2 className="section-title">What We Build</h2>
          <p className="section-subtitle">From Google Sheets workflows to AI-powered chatbots, we create automation tools that save you hours every week.</p>
        </div>
        <div className="horizontal-scroll-mobile">
          {[
            { img:'google-sheets-dark.png', title:'Google Sheets Automation', feats:['Automated workflows','Real-time data synchronisation','Custom functions and formulas'] },
            { img:'workflows-dark.png', title:'AI Workflows', feats:['GPT-powered automation','Lead qualification','Internal knowledge bases'] },
            { img:'workflows-dark.png', title:'Process Automation', feats:['Tool integrations','Smart workflows','Eliminate repetitive tasks'] },
            { img:'crm-dark.png', title:'MCP Integration', feats:['Claude & ChatGPT connections','Seamless data flow','USB-C for AI'] },
            { img:'crm-dark.png', title:'Custom CRM Systems', feats:['Scalable solutions','Automated lead tracking','Smart follow-ups'] },
          ].map((c,i) => (
            <div key={i} className="project-card">
              <div className="project-image-wrapper">
                <div className="timeline-image-placeholder">
                  <img src={`/images/${c.img}`} className="project-card-image" alt={c.title} />
                </div>
              </div>
              <div className="project-content">
                <h3>{c.title}</h3>
                <div className="project-features">
                  {c.feats.map((f,j) => (
                    <div key={j} className="feature-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <p>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="scroll-hint"><span className="scroll-hint-text">← Scroll →</span></div>
      </section>

      {/* Case Studies Carousel */}
      <section className="work-examples">
        <div className="container">
          <h2 className="section-title">Real Results from Real Projects</h2>
          <p className="section-subtitle">See how our automation solutions have transformed businesses with measurable results and proven ROI.</p>
        </div>
        <div className="carousel-container">
          <div className="carousel-wrapper">
            <div className="carousel-track" ref={trackRef} id="carouselTrack">
              {CAROUSEL_SLIDES.map((s,i) => (
                <div key={i} className="carousel-slide">
                  <div className="video-container">
                    <div className="video-wrapper">
                      <div className="youtube-player" data-video-id={s.videoId}
                        style={{width:'100%',aspectRatio:'16/9',background:'#111',borderRadius:'12px',overflow:'hidden',position:'relative'}}>
                        <iframe
                          src={`https://www.youtube.com/embed/${s.videoId}?rel=0&modestbranding=1`}
                          title={s.videoTitle} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                          style={{width:'100%',height:'100%',position:'absolute',inset:0}} />
                      </div>
                      <div className="video-title">{s.videoTitle}</div>
                      <div className="video-description">{s.videoDesc}</div>
                    </div>
                  </div>
                  <div className="work-content">
                    <h2>{s.title}</h2>
                    <p>{s.desc}</p>
                    <div className="work-stats">
                      {s.stats.map((st,j) => (
                        <div key={j} className="stat-item">
                          <div className="stat-number">{st.n}</div>
                          <div className="stat-label">{st.l}</div>
                        </div>
                      ))}
                    </div>
                    <Link to={s.href} className="cta-button">View Case Study</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="carousel-controls">
            <button className="carousel-button" onClick={() => goTo((currentRef.current - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}>‹</button>
            <div className="carousel-indicators">
              {CAROUSEL_SLIDES.map((_,i) => (
                <button key={i} className={`indicator${i===0?' active':''}`} onClick={() => goTo(i)} />
              ))}
            </div>
            <button className="carousel-button" onClick={() => goTo((currentRef.current + 1) % CAROUSEL_SLIDES.length)}>›</button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="how-it-works-timeline" id="how-it-works">
        <div className="timeline-bg-decoration">
          <div className="timeline-bg-circle-1" /><div className="timeline-bg-circle-2" />
        </div>
        <div className="timeline-container">
          <div className="timeline-header">
            <span className="timeline-badge">Start Your Journey</span>
            <h2>Your Journey Starts Here</h2>
            <p>We've made it incredibly simple to automate your business processes and save time.</p>
          </div>
          <div className="timeline-line" />
          <div className="timeline-items">
            {[
              { n:1, color:'icon-orange', title:'Audit & Strategy', desc:"We analyse your workflows and identify the best automation opportunities for maximum impact.", img:'timeline-1.png' },
              { n:2, color:'icon-green',  title:'Build & Test',     desc:"Our team builds your custom automation using proven tools and thoroughly tests everything before delivery.", img:'timeline-2.png' },
              { n:3, color:'icon-teal',   title:'Implement & Support', desc:"We deploy your automation and provide training and ongoing support for smooth operation.", img:'timeline-3.png' },
              { n:4, color:'icon-yellow', title:'Grow & Optimise', desc:"Watch productivity soar and costs decrease. We continue to optimise your automation for maximum ROI.", img:'timeline-4.png' },
            ].map(s => (
              <div key={s.n} className="timeline-item">
                <div className="timeline-content">
                  <div className={`timeline-icon ${s.color}`}>
                    <span className="timeline-icon-title">{s.title}</span>
                  </div>
                  <p>{s.desc}</p>
                </div>
                <div className="timeline-number-wrapper">
                  <div className="timeline-number">{s.n}</div>
                  <div className="timeline-number-pulse" />
                </div>
                <div className="timeline-image-wrapper">
                  <div className="timeline-image">
                    <div className="timeline-image-overlay" />
                    <div className="timeline-image-placeholder">
                      <img src={`/images/${s.img}`} className="project-card-image" alt={s.title} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="testimonial-grid">
            {[
              { text: '"AutoFlow Studio automated our entire order processing workflow. What used to take our team 3 hours daily now happens automatically in minutes."', author: 'Sarah Chen, E-commerce Founder' },
              { text: '"The Google Sheets automation they built saves us 15 hours per week. The ROI was immediate and the support has been fantastic."', author: 'Marcus Rodriguez, Operations Manager' },
              { text: '"Finally, someone who understands both the technical side and business needs. They delivered exactly what we needed, on time."', author: 'Lisa Park, Startup Founder' },
            ].map((t,i) => (
              <div key={i} className="testimonial">
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">{t.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section id="booking" className="booking-section">
        <div className="booking-bg-decoration">
          <div className="booking-circle-1" /><div className="booking-circle-2" /><div className="booking-noise" />
        </div>
        <div className="booking-container">
          <div className="booking-flex">
            <div className="booking-text">
              <h2 className="booking-title">Book Your <br /><span className="text-gradient">Automation Audit</span></h2>
              <p className="booking-description">From custom workflows to AI automation, we build solutions tailored to your business needs.</p>
              <div className="booking-features">
                <div className="feature-pill"><div className="pill-icon">⭐</div><span>Expert Automation Engineers</span></div>
                <div className="feature-pill"><div className="pill-icon">⚡</div><span>Custom Built Solutions</span></div>
              </div>
            </div>
            <div className="booking-form-wrapper">
              <div className="form-glass-container">
                <div className="form-inner">
                  <BookingForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
