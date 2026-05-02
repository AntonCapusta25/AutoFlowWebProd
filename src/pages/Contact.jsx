import { useEffect } from 'react'
import ContactForm from '../components/ContactForm'
import BookingForm from '../components/BookingForm'

export default function Contact() {
  useEffect(() => {
    document.title = "Contact - AutoFlow Studio"
  }, [])

  return (
    <main className="main-content">
      <section className="blog-header">
        <div className="hero-background">
          <div className="abstract-element sphere-1" />
          <div className="abstract-element sphere-2" />
          <div className="geometric-shapes"><div className="dots-pattern" /></div>
        </div>
        <div className="container">
          <h1>Let's Automate Your Workflow</h1>
          <p>Ready to eliminate manual work and save hours every week? Let's discuss your automation needs.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-form">
              <h3 style={{marginBottom:'30px',color:'#1a1a1a'}}>Start Your Automation Journey</h3>
              <ContactForm />
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Book a Call</h3>
                <p>Prefer to talk? Schedule a free 30-minute automation audit call.</p>
                <a href="https://autoflow.neetocal.com/meeting-with-auto-flow" target="_blank" rel="noreferrer"
                  className="cta-button" style={{display:'inline-block',marginTop:'15px'}} id="bookCallBtn">
                  Book Free Audit Call
                </a>
              </div>
              <div className="contact-item">
                <h3>Location</h3>
                <p>Based in the Netherlands<br />Working with clients worldwide<br />Available in multiple time zones</p>
              </div>
              <div className="contact-item">
                <h3>Connect With Us</h3>
                <p>Follow our latest automation insights:</p>
                <div className="social-links">
                  {[
                    { href:'https://www.instagram.com/auto.flow25', label:'Instagram' },
                    { href:'https://www.linkedin.com/company/auto-flow-studio/', label:'LinkedIn' },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="contact-social-link" title={s.label}
                      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'40px',height:'40px',borderRadius:'50%',background:'linear-gradient(135deg,#e91e63,#9c27b0)',textDecoration:'none',color:'white'}}>
                      {s.label[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div style={{marginTop:'80px'}}>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(350px,1fr))',gap:'30px',marginTop:'40px'}}>
              {[
                { q:'How long does a typical project take?', a:'Most automation projects are delivered within 5–7 business days. Complex integrations may take 10–14 days. We always provide a clear timeline before starting.' },
                { q:'Do I need technical knowledge?', a:'Not at all! We handle all the technical aspects and provide clear documentation and training. You just need to know your business processes.' },
                { q:'What if I need changes later?', a:'All projects include 30 days of free support. After that, we offer flexible maintenance plans or per-request updates.' },
                { q:'Do you work with small businesses?', a:'Absolutely! We work with solo entrepreneurs to enterprise teams. Our solutions scale with your business needs and budget.' },
              ].map((f,i) => (
                <div key={i} style={{background:'white',padding:'30px',borderRadius:'15px',boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                  <h4 style={{color:'#1a1a1a',marginBottom:'15px',fontSize:'1.1rem'}}>{f.q}</h4>
                  <p style={{color:'#6b7280',lineHeight:1.6}}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking form section */}
      <section id="booking" className="booking-section">
        <div className="booking-bg-decoration">
          <div className="booking-circle-1" /><div className="booking-circle-2" /><div className="booking-noise" />
        </div>
        <div className="booking-container">
          <div className="booking-flex">
            <div className="booking-text">
              <h2 className="booking-title">Ready to <br /><span className="text-gradient">Scale Your Business?</span></h2>
              <p className="booking-description">From professional workflows to AI automation, we build experiences tailored to your business needs.</p>
              <div className="booking-features">
                <div className="feature-pill"><div className="pill-icon">⭐</div><span>Expert Automation Engineers</span></div>
                <div className="feature-pill"><div className="pill-icon">⚡</div><span>Custom Built Solutions</span></div>
              </div>
            </div>
            <div className="booking-form-wrapper">
              <div className="form-glass-container">
                <div className="form-inner">
                  <BookingForm title="Get Free Audit" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
