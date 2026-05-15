import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, sendEmailNotification } from '../lib/supabase'

const STEPS = [
  {
    id: 'intro',
    question: { en: 'What problem do you have?', nl: 'Welk probleem heeft u?' },
    type: 'text',
    field: 'message'
  },
  {
    id: 'size',
    question: { en: 'What is your business size?', nl: 'Hoe groot is uw bedrijf?' },
    type: 'pills',
    field: 'size',
    options: [
      { id: 'solo', label: { en: 'Solo-Preneur', nl: 'Solo-Ondernemer' } },
      { id: 'startup', label: { en: 'Startup (1–10)', nl: 'Startup (1–10)' } },
      { id: 'team', label: { en: 'Team (10–50)', nl: 'Team (10–50)' } },
      { id: 'enterprise', label: { en: 'Enterprise (50+)', nl: 'Enterprise (50+)' } }
    ]
  },
  {
    id: 'service',
    question: { en: 'Which service interests you most?', nl: 'Welke service interesseert u het meest?' },
    type: 'pills',
    field: 'service',
    options: [
      { id: 'ai-agents', label: { en: 'AI Agent Development', nl: 'AI Agent Ontwikkeling' } },
      { id: 'process-auto', label: { en: 'End-to-End Automation', nl: 'End-to-End Automatisering' } },
      { id: 'lead-gen', label: { en: 'Lead Generation', nl: 'Lead Generatie' } },
      { id: 'data-intel', label: { en: 'Data Intelligence', nl: 'Data Intelligence' } },
      { id: 'custom', label: { en: 'Custom Integration', nl: 'Maatwerk Integratie' } }
    ]
  },
  {
    id: 'contact',
    question: { en: 'Lastly, how can we reach you?', nl: 'Ten slotte, hoe kunnen we u bereiken?' },
    type: 'contact',
    fields: ['name', 'email', 'phone']
  }
]

export default function MultiStepBooking({ isOpen, onClose, initialQuery = '', lang = 'en' }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState({ 
    message: initialQuery, 
    size: '', 
    service: '', 
    name: '', 
    email: '', 
    phone: '' 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (initialQuery) setForm(f => ({ ...f, message: initialQuery }))
  }, [initialQuery])

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      handleSubmit()
    }
  }

  const prev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('booking_leads').insert([{
        ...form,
        platform: 'TYPEFORM_FLOW',
      }])
      if (error) throw error
      await sendEmailNotification({ type: 'booking', ...form })
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setCurrentStep(0)
        setForm({ message: '', size: '', service: '', name: '', email: '', phone: '' })
      }, 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const step = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'rgba(5, 5, 5, 0.95)', backdropFilter: 'blur(10px)'
    }}>
      {/* Progress Bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
        background: 'rgba(255,255,255,0.1)'
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #e91e63, #9c27b0)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <button 
        onClick={onClose}
        style={{
          position: 'absolute', top: '30px', right: '30px',
          background: 'none', border: 'none', color: 'white', cursor: 'pointer',
          padding: '10px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'left' }}>
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                color: 'white', marginBottom: '40px', lineHeight: 1.2
              }}>
                {step.question[lang]}
              </h2>

              {step.type === 'text' && (
                <div style={{ marginBottom: '40px' }}>
                  <input 
                    autoFocus
                    className="typeform-input"
                    value={form[step.field]}
                    onChange={e => setForm(f => ({ ...f, [step.field]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && next()}
                    placeholder="Type your answer here..."
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      borderBottom: '2px solid rgba(233, 30, 99, 0.3)',
                      color: 'white', fontSize: '1.5rem', padding: '10px 0',
                      outline: 'none', transition: 'border-color 0.3s'
                    }}
                  />
                  <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                    Press <strong>Enter ↵</strong>
                  </p>
                </div>
              )}

              {step.type === 'pills' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
                  {step.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setForm(f => ({ ...f, [step.field]: opt.id }))
                        setTimeout(next, 300)
                      }}
                      style={{
                        padding: '16px 32px', borderRadius: '50px',
                        background: form[step.field] === opt.id ? '#e91e63' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', cursor: 'pointer', fontSize: '1.1rem',
                        transition: 'all 0.2s ease', fontFamily: "'Space Grotesk', sans-serif"
                      }}
                    >
                      {opt.label[lang]}
                    </button>
                  ))}
                </div>
              )}

              {step.type === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                  <input 
                    placeholder="Full Name"
                    className="typeform-input"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={contactInputStyle}
                  />
                  <input 
                    placeholder="Email Address"
                    type="email"
                    className="typeform-input"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={contactInputStyle}
                  />
                  <input 
                    placeholder="Phone Number"
                    className="typeform-input"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    style={contactInputStyle}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button 
                  onClick={next}
                  className="typeform-btn"
                  style={{
                    background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
                    color: 'white', border: 'none', padding: '16px 40px',
                    borderRadius: '12px', cursor: 'pointer', fontWeight: 700,
                    fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(233, 30, 99, 0.3)'
                  }}
                >
                  {currentStep === STEPS.length - 1 ? (isSubmitting ? 'Sending...' : 'Complete') : 'Next'}
                </button>
                {currentStep > 0 && (
                  <button 
                    onClick={prev}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                  >
                    Go Back
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', color: 'white', marginBottom: '10px' }}>
                Awesome!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                We've received your request and will reach out shortly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .typeform-input:focus {
          border-bottom-color: #e91e63 !important;
        }
        .typeform-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        @media (max-width: 600px) {
          .typeform-input { font-size: 1.2rem !important; }
        }
      `}</style>
    </div>
  )
}

const contactInputStyle = {
  width: '100%', background: 'transparent', border: 'none',
  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  color: 'white', fontSize: '1.2rem', padding: '12px 0',
  outline: 'none', transition: 'border-color 0.3s'
}
