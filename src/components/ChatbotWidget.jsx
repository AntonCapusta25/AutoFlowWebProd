import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

export default function ChatbotWidget() {
  const location = useLocation()
  const isNl = location.pathname.startsWith('/nl')
  
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    // Starting messages
    const welcome = isNl 
      ? 'Hallo! Ik ben de AI-assistent van AutoFlow Studio. Hoe kan ik u vandaag helpen met automatisering?'
      : 'Hello! I am AutoFlow Studio\'s AI assistant. How can I help you automate your business today?'
    return [{ role: 'model', content: welcome, id: 'welcome' }]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Re-initialize welcome message if language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        const welcome = isNl 
          ? 'Hallo! Ik ben de AI-assistent van AutoFlow Studio. Hoe kan ik u vandaag helpen met automatisering?'
          : 'Hello! I am AutoFlow Studio\'s AI assistant. How can I help you automate your business today?'
        return [{ role: 'model', content: welcome, id: 'welcome' }]
      }
      return prev
    })
  }, [isNl])

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, isOpen])

  const quickChips = isNl
    ? [
        { label: 'Wat doen jullie?', text: 'Wat doen jullie?' },
        { label: 'Tarieven & Prijzen', text: 'Wat zijn jullie tarieven en prijzen?' },
        { label: 'Voorbeelden', text: 'Kun je voorbeelden geven van automatiseringen?' },
        { label: 'Gesprek Boeken', action: 'book' }
      ]
    : [
        { label: 'What do you do?', text: 'What do you do?' },
        { label: 'Pricing & Rates', text: 'What are your rates and pricing?' },
        { label: 'Examples', text: 'Can you show examples of automations?' },
        { label: 'Book a Call', action: 'book' }
      ]

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text) return

    if (!textToSend) setInput('')

    const userMsg = { role: 'user', content: text, id: Math.random().toString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Supabase Edge Function URL
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }

      // Keep only last 10 messages for context size efficiency
      const historyContext = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          history: historyContext
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reply')

      const modelMsg = { role: 'model', content: data.reply, id: Math.random().toString() }
      setMessages(prev => [...prev, modelMsg])
    } catch (err) {
      console.error('[chatbot] Failed to chat:', err)
      const errorMsg = isNl
        ? 'Sorry, er is een fout opgetreden. Probeer het later opnieuw.'
        : 'Sorry, an error occurred. Please try again later.'
      setMessages(prev => [...prev, { role: 'model', content: errorMsg, id: Math.random().toString() }])
    } finally {
      setLoading(false)
    }
  }

  const handleChipClick = (chip) => {
    if (chip.action === 'book') {
      window.dispatchEvent(new CustomEvent('open-booking'))
      // Automatically add a helpful assistant message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: isNl 
            ? 'Ik heb het boekingsformulier voor je geopend! Vul je gegevens in en we spreken elkaar snel.'
            : 'I\'ve opened the booking form for you! Please fill in your details and we will speak soon.', 
          id: Math.random().toString() 
        }
      ])
    } else {
      handleSendMessage(chip.text)
    }
  }

  // Render markdown bold and bullets simply
  const formatMsgText = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line
      
      // Handle list bullets
      const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-')
      if (isBullet) {
        content = line.trim().replace(/^[*+-]\s*/, '')
      }

      // Handle simple bold parsing: **text**
      const parts = content.split('**')
      const renderedParts = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} style={{ color: '#F8FAFC', fontWeight: 700 }}>{part}</strong>
        }
        return part
      })

      if (isBullet) {
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'disc', color: '#E2E8F0' }}>
            <span>{renderedParts}</span>
          </li>
        )
      }

      return (
        <p key={idx} style={{ margin: '0 0 8px 0', minHeight: '1.2em', color: '#E2E8F0', lineHeight: 1.5 }}>
          {renderedParts}
        </p>
      )
    })
  }

  return (
    <>
      {/* Floating Chat Bubble */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Chat"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 32px rgba(86, 70, 228, 0.4), 0 0 0 1px rgba(209, 187, 251, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            outline: 'none',
            position: 'relative',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Pulsing glow ring */}
          <div style={{
            position: 'absolute',
            inset: '-4px',
            border: '2px solid #d1bbfb',
            borderRadius: '50%',
            opacity: 0.4,
            animation: 'pulsate 2s infinite ease-out'
          }} />
          <style>{`
            @keyframes pulsate {
              0% { transform: scale(0.9); opacity: 0.8; }
              100% { transform: scale(1.25); opacity: 0; }
            }
            .chat-scroll::-webkit-scrollbar { width: 5px; }
            .chat-scroll::-webkit-scrollbar-track { background: transparent; }
            .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
            .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
          `}</style>

          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '28px',
              width: '380px',
              height: '560px',
              background: 'rgba(10, 10, 12, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9998,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'linear-gradient(180deg, rgba(86, 70, 228, 0.06) 0%, transparent 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(209, 187, 251, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(209, 187, 251, 0.2)'
                }}>
                  <img src="/images/logo.webp" alt="Logo" width="18" height="18" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>AutoFlow Bot</h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', fontSize: '0.72rem', fontWeight: 600 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    Active Support
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* WhatsApp Direct Link */}
                <a
                  href="https://wa.me/31636222681"
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp Support"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="chat-scroll"
              style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(5, 5, 5, 0.2) 100%)'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '14px 18px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)' 
                      : 'rgba(255, 255, 255, 0.04)',
                    border: msg.role === 'user' 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 12px rgba(86, 70, 228, 0.15)'
                      : 'none',
                    fontSize: '0.85rem'
                  }}>
                    {msg.role === 'user' ? (
                      <p style={{ margin: 0, color: 'white', lineHeight: 1.5 }}>{msg.content}</p>
                    ) : (
                      formatMsgText(msg.content)
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span className="dot" style={{ width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                    <span className="dot" style={{ width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                    <span className="dot" style={{ width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                    <style>{`
                      @keyframes bounce {
                        0%, 80%, 100% { transform: scale(0); }
                        40% { transform: scale(1.0); }
                      }
                    `}</style>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips & Footer Input */}
            <div style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(5, 5, 5, 0.4)'
            }}>
              {/* Quick Chips Ticker */}
              <div className="chat-scroll" style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '12px'
              }}>
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 14px',
                      borderRadius: '30px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(209, 187, 251, 0.3)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = '#F8FAFC'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.color = '#94A3B8'
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input box */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '5px 5px 5px 16px',
                  boxSizing: 'border-box'
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isNl ? 'Vraag iets...' : 'Ask a question...'}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    fontSize: '0.82rem',
                    padding: '8px 0'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: (!input.trim() || loading) ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                    outline: 'none'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
