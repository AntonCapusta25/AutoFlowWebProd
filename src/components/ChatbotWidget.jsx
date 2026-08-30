import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function ChatbotWidget() {
  const location = useLocation()
  const isNl = location.pathname.startsWith('/nl')
  
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState('chat') // 'chat' or 'history'
  
  // Database Chat Session State
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [chatHistoryList, setChatHistoryList] = useState([])
  const [dbResponseTree, setDbResponseTree] = useState([])
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Dynamic theme config based on active page route
  let chatTheme = {
    bg: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
    shadow: '0 12px 32px rgba(86, 70, 228, 0.45)',
    ring: '#d1bbfb',
    headerBg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    logo: '/images/logo.webp'
  }

  if (location.pathname.includes('/solutions/b2b-automation')) {
    chatTheme = {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      shadow: '0 12px 32px rgba(37, 99, 235, 0.55)',
      ring: '#3b82f6',
      headerBg: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      logo: '/images/logo_blue.png'
    }
  } else if (
    location.pathname.includes('/solutions/horeca-hospitality') || 
    location.pathname.includes('/solutions/marketing-agency') || 
    location.pathname.includes('/solutions/hvac-field-services')
  ) {
    chatTheme = {
      bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      shadow: '0 12px 32px rgba(225, 29, 72, 0.55)',
      ring: '#f43f5e',
      headerBg: 'linear-gradient(135deg, #881337 0%, #0f172a 100%)',
      logo: '/images/logo_red.png'
    }
  }

  // Default Fallback Response Tree (if database table is empty)
  const fallbackResponseTree = {
    en: {
      'what do you do?': 'We build custom AI automation tools, database systems, and integrations to eliminate your manual work. From CRM syncing to AI chatbots, we automate it all. Check out our projects: [View Portfolio](action:portfolio)',
      'pricing & rates': 'Pricing is custom based on project complexity. Smaller automations start low and are delivered within 7 days. Book a strategy session for a custom quote: [Book a Call](action:book)',
      'examples': 'Some examples of what we build:\n* **AI Chatbots** with CRM integration\n* **Database Syncs** (Google Sheets, Airtable, SQL)\n* **Automatic Lead Responders** via Email/WhatsApp\n[View Portfolio](action:portfolio)',
      'book a call': 'Opening the booking calendar for you now! Fill in your details to lock in a slot: [Book a Call](action:book)'
    },
    nl: {
      'wat doen jullie?': 'Wij bouwen op maat gemaakte AI-automatiseringsoplossingen, databasekoppelingen en workflows om uw handmatige werk te elimineren. Bekijk onze projecten: [Bekijk Portfolio](action:portfolio)',
      'tarieven & prijzen': 'Tarieven zijn op maat en afhankelijk van de complexiteit van de automatisering. Kleinere projecten worden binnen 7 dagen opgeleverd. Boek een gesprek voor een offerte: [Gesprek Boeken](action:book)',
      'voorbeelden': 'Enkele voorbeelden van wat we bouwen:\n* **AI Chatbots** met CRM-integratie\n* **Database Koppelingen** (Google Sheets, Airtable, SQL)\n* **Automatische Lead Responders** via Email/WhatsApp\n[Bekijk Portfolio](action:portfolio)',
      'gesprek boeken': 'Ik open het boekingsformulier nu voor u! Vul uw gegevens in om een afspraak in te plannen: [Gesprek Boeken](action:book)'
    }
  }

  // 1. Fetch DB Response Tree on mount
  useEffect(() => {
    async function loadDbTree() {
      try {
        const { data } = await supabase.from('chatbot_response_tree').select('*')
        if (data) setDbResponseTree(data)
      } catch (err) {
        console.error('Failed to load db response tree:', err)
      }
    }
    loadDbTree()
  }, [])

  // Helper to fetch matching trigger response for exact quick chips/keywords only
  const matchResponseTree = (text) => {
    const normalized = text.toLowerCase().trim().replace(/[?.!]/g, '')
    const lang = isNl ? 'nl' : 'en'

    // Try DB Tree first (exact or phrase match)
    const dbMatch = dbResponseTree.find(entry => {
      const trigger = entry.trigger_word.toLowerCase().trim()
      return (normalized === trigger || normalized.includes(trigger)) && entry.lang === lang
    })
    if (dbMatch) return dbMatch.response_text

    // Fallback to local hardcoded tree (exact phrases only)
    const keys = Object.keys(fallbackResponseTree[lang])
    const matchedKey = keys.find(key => normalized === key || normalized === key.replace(/[?.!]/g, ''))
    if (matchedKey) return fallbackResponseTree[lang][matchedKey]

    return null
  }

  const parseMessageButtons = (text) => {
    const buttonRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const buttons = []
    let cleanText = text
    let match
    
    while ((match = buttonRegex.exec(text)) !== null) {
      buttons.push({
        label: match[1],
        action: match[2]
      })
    }

    cleanText = text.replace(buttonRegex, '').trim()
    return { cleanText, buttons }
  }

  const handleAction = (action) => {
    if (action === 'action:book') {
      window.dispatchEvent(new CustomEvent('open-booking'))
    } else if (action === 'action:whatsapp') {
      window.open('https://wa.me/31636222681', '_blank')
    } else if (action === 'action:portfolio') {
      window.location.href = '/portfolio'
    } else if (action.startsWith('http')) {
      window.open(action, '_blank')
    } else {
      window.location.href = action
    }
  }

  // 2. Load or Create Customer Chat Session Lazily
  const ensureChatSessionExists = async () => {
    if (activeChat) return activeChat

    try {
      const shortId = Math.random().toString(36).substring(2, 6).toUpperCase()
      const customerName = `Visitor #${shortId}`

      const { data, error } = await supabase
        .from('customer_chats')
        .insert([{ 
          session_id: Math.random().toString(36).substring(2), 
          customer_name: customerName 
        }])
        .select()
        .single()
      
      if (error) throw error

      let storedIds = JSON.parse(localStorage.getItem('autoflow_chat_ids') || '[]')
      storedIds.push(data.id)
      localStorage.setItem('autoflow_chat_ids', JSON.stringify(storedIds))

      setActiveChat(data)
      return data
    } catch (err) {
      console.error('[chatbot] Failed to create chat session on demand:', err)
      return null
    }
  }

  const initChatSession = async (existingId = null) => {
    try {
      let chatId = existingId
      let storedIds = JSON.parse(localStorage.getItem('autoflow_chat_ids') || '[]')

      if (!chatId) {
        // Look up last active session from localStorage
        chatId = storedIds[storedIds.length - 1]
      }

      let chatData = null

      if (chatId) {
        // Verify chat exists in Supabase
        const { data } = await supabase
          .from('customer_chats')
          .select('*')
          .eq('id', chatId)
          .maybeSingle()
        chatData = data
      }

      if (chatData) {
        setActiveChat(chatData)
        loadMessages(chatData.id)
      } else {
        const welcome = isNl 
          ? 'Hallo! Ik ben de AI-assistent van AutoFlow Studio. Hoe kan ik u vandaag helpen met automatisering?'
          : 'Hello! I am AutoFlow Studio\'s AI assistant. How can I help you automate your business today?'
        setMessages([{ role: 'model', content: welcome, id: 'welcome' }])
      }
      return chatData
    } catch (err) {
      console.error('[chatbot] Failed to initialize chat session:', err)
      return null
    }
  }

  const loadMessages = async (chatId) => {
    try {
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (!error && data) {
        // Map data rows to local messages format
        const mapped = data.map(msg => ({
          role: msg.sender_type === 'customer' ? 'user' : 'model',
          content: msg.content,
          id: msg.id,
          sender_type: msg.sender_type
        }))

        if (mapped.length === 0) {
          // If empty chat history, show welcome
          const welcome = isNl 
            ? 'Hallo! Ik ben de AI-assistent van AutoFlow Studio. Hoe kan ik u vandaag helpen met automatisering?'
            : 'Hello! I am AutoFlow Studio\'s AI assistant. How can I help you automate your business today?'
          
          setMessages([{ role: 'model', content: welcome, id: 'welcome' }])
        } else {
          setMessages(mapped)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadChatHistoryList = async () => {
    try {
      const storedIds = JSON.parse(localStorage.getItem('autoflow_chat_ids') || '[]')
      if (storedIds.length === 0) {
        setChatHistoryList([])
        return
      }

      const { data, error } = await supabase
        .from('customer_chats')
        .select('*')
        .in('id', storedIds)
        .order('updated_at', { ascending: false })
      
      if (!error && data) {
        setChatHistoryList(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Load chat session on mount
  useEffect(() => {
    initChatSession()
  }, [])

  // Fetch history list when viewMode changes to history
  useEffect(() => {
    if (viewMode === 'history') {
      loadChatHistoryList()
    }
  }, [viewMode])

  // 3. Real-time subscriptions for active conversation
  useEffect(() => {
    if (!activeChat?.id) return

    // Message insertions
    const msgChannel = supabase
      .channel(`customer-messages-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'customer_messages'
      }, (payload) => {
        if (payload.new.chat_id === activeChat.id) {
          // Ignore bot and customer insertions since they are rendered instantly locally
          if (payload.new.sender_type !== 'human') return

          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            const cleanPrev = prev.filter(m => m.id !== 'welcome')
            return [...cleanPrev, { role: 'model', content: payload.new.content, id: payload.new.id }]
          })
        }
      })
      .subscribe()

    // Chat status changes (takeovers)
    const chatChannel = supabase
      .channel(`customer-chat-status-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'customer_chats',
        filter: `id=eq.${activeChat.id}`
      }, (payload) => {
        setActiveChat(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(chatChannel)
    }
  }, [activeChat?.id])

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
        { label: 'Gesprek Boeken', action: 'book' },
        { label: 'Spreek met een agent', action: 'takeover' }
      ]
    : [
        { label: 'What do you do?', text: 'What do you do?' },
        { label: 'Pricing & Rates', text: 'What are your rates and pricing?' },
        { label: 'Examples', text: 'Can you show examples of automations?' },
        { label: 'Book a Call', action: 'book' },
        { label: 'Speak with Agent', action: 'takeover' }
      ]

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text) return

    if (!textToSend) setInput('')

    // Generate local random ID
    const localId = Math.random().toString()
    const cleanWelcome = messages.filter(m => m.id !== 'welcome')
    setMessages([...cleanWelcome, { role: 'user', content: text, id: localId, sender_type: 'customer' }])

    // Ensure chat session is created in DB
    const currentChat = await ensureChatSessionExists()

    // 1. Insert customer message into DB table (if activeChat/currentChat is loaded)
    if (currentChat) {
      supabase.from('customer_messages').insert([{
        chat_id: currentChat.id,
        sender_type: 'customer',
        content: text
      }]).then(() => {
        // Update updated_at for ordering
        supabase
          .from('customer_chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentChat.id)
      }).catch(err => console.error('[chatbot] Failed to save customer message to DB:', err))
    }

    // If human agent takeover is active, do not let automated bot interfere
    if (currentChat && currentChat.status === 'human') {
      return
    }

    setLoading(true)

    // 2. Try to match configurable response tree offline (instantly)
    const localAnswer = matchResponseTree(text)
    if (localAnswer) {
      await new Promise(resolve => setTimeout(resolve, 150))
      
      setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), { role: 'model', content: localAnswer, id: Math.random().toString(), sender_type: 'bot' }])
      setLoading(false)

      // Save bot answer directly to database if currentChat is loaded
      if (currentChat) {
        supabase
          .from('customer_messages')
          .insert([{
            chat_id: currentChat.id,
            sender_type: 'bot',
            content: localAnswer
          }])
          .then(({ error }) => {
            if (error) console.error('[chatbot] Failed to save bot reply to DB:', error.message)
          })
      }
      return
    }

    // 3. Query AI Response
    let botReply = null
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }

      const historyContext = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          chat_id: currentChat?.id || null,
          history: historyContext
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data && data.reply && typeof data.reply === 'string' && data.reply.trim()) {
          botReply = data.reply
        }
      }
    } catch (_err) {
      // Silently fall back to smart AI response engine
    }

    if (!botReply) {
      botReply = generateSmartFallbackResponse(text, isNl)
    }

    setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), { role: 'model', content: botReply, id: Math.random().toString(), sender_type: 'bot' }])

    if (currentChat) {
      try {
        await supabase
          .from('customer_messages')
          .insert([{
            chat_id: currentChat.id,
            sender_type: 'bot',
            content: botReply
          }])
      } catch (_e) {}
    }

    setLoading(false)
  }

  // Request human takeover & auto-assign Walid
  const handleRequestTakeover = async () => {
    let currentChat = activeChat
    if (!currentChat) {
      // Try to initialize it first
      currentChat = await ensureChatSessionExists()
    }
    if (!currentChat) {
      // Fallback local message
      const fallbackMsg = isNl
        ? 'Er is geen actieve chat-sessie beschikbaar. Neem direct contact met ons op via e-mail (info@autoflowstudio.net) of WhatsApp!'
        : 'No active chat session is currently available. Please contact us directly via email (info@autoflowstudio.net) or WhatsApp!'
      setMessages(prev => [...prev.filter(m => m.id !== 'welcome'), { role: 'model', content: fallbackMsg, id: Math.random().toString() }])
      return
    }
    setLoading(true)
    try {
      // 1. Resolve Walid profile from profiles table
      const { data: walidProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .or("email.ilike.%walid%,name.ilike.%walid%")
        .maybeSingle()

      const walidId = walidProfile?.id || null
      const walidEmail = walidProfile?.email || null

      // 2. Update chat session status & assignment in db
      const { data: updatedChat } = await supabase
        .from('customer_chats')
        .update({
          status: 'needs_human',
          assigned_to: walidId,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeChat.id)
        .select()
        .single()

      if (updatedChat) {
        setActiveChat(updatedChat)
      }

      // 3. Insert system messages
      const statusMsgText = isNl
        ? 'Ik verbind u door met een medewerker. Een ogenblik geduld alstublieft...'
        : 'Searching for an active specialist... An agent will take over shortly.'
      
      await supabase.from('customer_messages').insert([{
        chat_id: activeChat.id,
        sender_type: 'bot',
        content: statusMsgText
      }])

      // 4. Send Gmail notifications using Edge Function
      const sendEmailUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
      const emailHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }

      const emailHtml = `
        <div style="font-family: sans-serif; padding: 32px; background: #f8fafc; border-radius: 16px;">
          <h2 style="color: #1e293b;">Live Chat Takeover Request</h2>
          <p>A customer has requested to speak with a human agent on <strong>autoflowstudio.net</strong>.</p>
          <p><strong>Customer Name:</strong> Visitor</p>
          <p><strong>Chat Session ID:</strong> ${activeChat.id}</p>
          <p style="margin-top: 24px;">
            <a href="https://autoflowstudio.net/admin/chat" style="padding: 12px 24px; background: #5646e4; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Open Chat Takeover Panel
            </a>
          </p>
        </div>
      `

      // Send notification to info and Alex
      const staticRecipients = ['info@autoflowstudio.net', 'bangalexf@gmail.com']
      staticRecipients.forEach(email => {
        fetch(sendEmailUrl, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify({
            type: 'chatbot_notification',
            recipient: email,
            subject: '⚡ Customer Requesting Live Chat Takeover',
            html: emailHtml
          })
        }).catch(err => console.error(`Failed to notify ${email}:`, err))
      })

      // Notification to Walid
      if (walidEmail && !staticRecipients.includes(walidEmail)) {
        fetch(sendEmailUrl, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify({
            type: 'chatbot_notification',
            recipient: walidEmail,
            subject: '⚡ Live Chat Takeover Assigned to You',
            html: emailHtml
          })
        }).catch(err => console.error('Failed to notify Walid:', err))
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChipClick = (chip) => {
    if (chip.action === 'book') {
      window.dispatchEvent(new CustomEvent('open-booking'))
      
      const contentText = isNl 
        ? 'Ik heb het boekingsformulier voor je geopend! Vul je gegevens in en we spreken elkaar snel.'
        : 'I\'ve opened the booking form for you! Please fill in your details and we will speak soon.'
      
      const cleanWelcome = messages.filter(m => m.id !== 'welcome')
      setMessages([...cleanWelcome, { role: 'model', content: contentText, id: Math.random().toString() }])

      if (activeChat) {
        supabase.from('customer_messages').insert([{
          chat_id: activeChat.id,
          sender_type: 'bot',
          content: contentText
        }]).then(({ error }) => {
          if (error) console.error('[chatbot] Failed to save bot message to DB:', error.message)
        })
      }
    } else if (chip.action === 'takeover') {
      handleRequestTakeover()
    } else {
      handleSendMessage(chip.text)
    }
  }

  // Starts a clean new chat session
  const handleStartNewChat = async () => {
    setActiveChat(null)
    setMessages([])
    setViewMode('chat')

    const welcome = isNl 
      ? 'Hallo! Ik ben de AI-assistent van AutoFlow Studio. Hoe kan ik u vandaag helpen met automatisering?'
      : 'Hello! I am AutoFlow Studio\'s AI assistant. How can I help you automate your business today?'
    setMessages([{ role: 'model', content: welcome, id: 'welcome' }])
  }

  // Switch to another previous chat session from history
  const handleSwitchChat = (docId) => {
    const storedIds = JSON.parse(localStorage.getItem('autoflow_chat_ids') || '[]')
    // Move selected chat to the end of history list (latest active)
    const filtered = storedIds.filter(id => id !== docId)
    filtered.push(docId)
    localStorage.setItem('autoflow_chat_ids', JSON.stringify(filtered))

    setViewMode('chat')
    initChatSession(docId)
  }

  // Parse markdown bold and list bullet styles
  const formatMsgText = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line
      
      const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-')
      if (isBullet) {
        content = line.trim().replace(/^[*+-]\s*/, '')
      }

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
      <div className="chatbot-launcher-wrapper" style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Chat"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: chatTheme.bg,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: chatTheme.shadow,
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
          {/* Pulsing ring animation */}
          <div style={{
            position: 'absolute',
            inset: '-4px',
            border: `2px solid ${chatTheme.ring}`,
            borderRadius: '50%',
            opacity: 0.5,
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

            @media (max-width: 600px) {
              .chatbot-popup-window {
                bottom: 0 !important;
                right: 0 !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                border-radius: 0 !important;
                border: none !important;
                z-index: 99999 !important;
              }
              .chatbot-mobile-close {
                display: flex !important;
              }
              .chatbot-launcher-wrapper {
                bottom: 16px !important;
                right: 16px !important;
              }
            }
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

      {/* Chat popup window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-popup-window"
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
              background: chatTheme.headerBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${chatTheme.ring}40`
                }}>
                  <img src={chatTheme.logo} alt="Logo" width="22" height="22" style={{ borderRadius: '50%' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '0.95rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {viewMode === 'chat' ? 'AutoFlow Bot' : 'Chat History'}
                  </h3>
                </div>
              </div>

              {/* Header Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Mobile close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="chatbot-mobile-close"
                  title="Close Chat"
                  style={{
                    display: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {viewMode === 'chat' ? (
                  <>
                    {/* Direct to WhatsApp Link */}
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

                    {/* View history folder/chats list */}
                    <button
                      onClick={() => setViewMode('history')}
                      title="Previous Chats"
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
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M12 7v5l4 2" />
                      </svg>
                    </button>
                  </>
                ) : (
                  /* Back to chat view button */
                  <button
                    onClick={() => setViewMode('chat')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                )}

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
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ===============================================================
                VIEW MODE: CHAT VIEW
                =============================================================== */}
            {viewMode === 'chat' && (
              <>
                {/* Active Chat Messages area */}
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
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    const { cleanText, buttons } = isUser 
                      ? { cleanText: msg.content, buttons: [] } 
                      : parseMessageButtons(msg.content)

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isUser ? 'flex-end' : 'flex-start',
                          width: '100%'
                        }}
                      >
                        <div 
                          className={isUser ? "chatbot-msg-user" : "chatbot-msg-bot"}
                          style={{
                            maxWidth: '85%',
                            padding: '14px 18px',
                            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isUser 
                            ? chatTheme.bg 
                            : 'rgba(255, 255, 255, 0.04)',
                          border: isUser 
                            ? '1px solid rgba(255,255,255,0.15)' 
                            : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isUser
                            ? chatTheme.shadow
                            : 'none',
                          fontSize: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div>
                            {isUser ? (
                              <p style={{ margin: 0, color: 'white', lineHeight: 1.5 }}>{cleanText}</p>
                            ) : (
                              formatMsgText(cleanText)
                            )}
                          </div>

                          {/* Inline buttons parsing */}
                          {buttons.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                              {buttons.map((btn, bIdx) => (
                                <button
                                  key={bIdx}
                                  className="chatbot-msg-button"
                                  onClick={() => handleAction(btn.action)}
                                  style={{
                                    padding: '8px 16px',
                                    background: chatTheme.bg,
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    boxShadow: chatTheme.shadow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.03)'
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(86, 70, 228, 0.35)'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(86, 70, 228, 0.25)'
                                  }}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Typing Indicator */}
                  {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                      <div style={{
                        padding: '12px 18px',
                        borderRadius: '18px 18px 18px 4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{
                              y: [0, -6, 0]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: 'easeInOut'
                            }}
                            style={{
                              width: '6px',
                              height: '6px',
                              background: '#94A3B8',
                              borderRadius: '50%',
                              display: 'inline-block'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Status Banner when takeover is active */}
                  {activeChat?.status === 'human' && !messages.some(m => m.sender_type === 'human') && (
                    <div style={{
                      margin: '8px 0',
                      padding: '8px 16px',
                      background: 'rgba(96, 165, 250, 0.08)',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      borderRadius: '12px',
                      color: '#60A5FA',
                      fontSize: '0.78rem',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      ⚡ Agent takeover active. You are chatting with support.
                    </div>
                  )}
                  {activeChat?.status === 'needs_human' && (
                    <div style={{
                      margin: '8px 0',
                      padding: '8px 16px',
                      background: 'rgba(248, 113, 113, 0.08)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      borderRadius: '12px',
                      color: '#F87171',
                      fontSize: '0.78rem',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      Searching for available support agent...
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Panel & Quick Chips */}
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
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
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
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: chatTheme.bg,
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
              </>
            )}

            {/* ===============================================================
                VIEW MODE: HISTORY LIST VIEW
                =============================================================== */}
            {viewMode === 'history' && (
              <div
                className="chat-scroll"
                style={{
                  flex: 1,
                  padding: '24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Create new chat session button */}
                <button
                  onClick={handleStartNewChat}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Chat Session
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Previous Chats (GDPR auto-cleaned in 30 days)
                  </p>
                  
                  {chatHistoryList.length === 0 ? (
                    <p style={{ color: '#64748B', fontSize: '0.8rem', textAlign: 'center', padding: '24px 0' }}>
                      No previous chat sessions found.
                    </p>
                  ) : (
                    chatHistoryList.map((doc) => {
                      const isActive = activeChat && activeChat.id === doc.id
                      const dateStr = new Date(doc.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      
                      return (
                        <button
                          key={doc.id}
                          onClick={() => handleSwitchChat(doc.id)}
                          style={{
                            padding: '12px 16px',
                            background: isActive ? 'rgba(209, 187, 251, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: isActive ? '1px solid rgba(209, 187, 251, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                              {doc.customer_name} Session
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                              Last active: {dateStr}
                            </span>
                          </div>
                          {doc.status === 'human' && (
                            <span style={{ fontSize: '0.6rem', color: '#60A5FA', border: '1px solid #60A5FA', padding: '1px 6px', borderRadius: '8px' }}>
                              Agent
                            </span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function generateSmartFallbackResponse(text, isNl) {
  const q = (text || '').toLowerCase().trim()

  // Off-topic, unrelated, or impossible requests (buying cars, recipes, jokes, sports, math, personal advice, etc.)
  const isOffTopic = 
    q.includes('car') || q.includes('buy') || q.includes('recipe') || 
    q.includes('joke') || q.includes('weather') || q.includes('movie') || 
    q.includes('crypto') || q.includes('game') || q.includes('food') ||
    q.includes('van') || q.includes('shoe') || q.includes('song') ||
    (!q.includes('autom') && !q.includes('crm') && !q.includes('lead') && !q.includes('price') && !q.includes('cost') && !q.includes('bot') && !q.includes('call') && !q.includes('book') && !q.includes('workflow') && !q.includes('software') && !q.includes('app') && !q.includes('b2b') && !q.includes('horeca') && !q.includes('agency') && !q.includes('contact') && !q.includes('email') && !q.includes('scrap') && !q.includes('python') && !q.includes('help') && !q.includes('hi') && !q.includes('hello'))

  if (isOffTopic && q.length > 2) {
    return isNl
      ? "Kijk, dat is hier niet mogelijk, maar laten we het over automatisering hebben! Waar kan ik u vandaag mee helpen? [Bekijk Oplossingen](action:portfolio) of [Plan een Call](action:book)"
      : "Look, that's not possible here, but let's speak about automations! What can I help you with today? [View Solutions](action:portfolio) or [Book a Call](action:book)"
  }

  // Domain Queries
  if (q.includes('b2b') || q.includes('operation') || q.includes('crm') || q.includes('portal') || q.includes('excel') || q.includes('sheet') || q.includes('database')) {
    return isNl 
      ? "Onze B2B-automatiseringsoplossingen omvatten maatwerk portalen, geautomatiseerde PDF-offertes en naadloze database-koppelingen (Postgres, Moneybird, Stripe). [Plan een Audit](action:book)"
      : "Our B2B operations solutions include custom client portals, automated PDF document generation, and seamless database syncs (Postgres, Stripe, CRMs). [Book an Audit](action:book)"
  }
  if (q.includes('horeca') || q.includes('restaurant') || q.includes('hotel') || q.includes('booking') || q.includes('table') || q.includes('no-show')) {
    return isNl
      ? "Voor de Horeca bouwen we commissievrije reserveringssystemen, automatische SMS/WhatsApp herinneringen tegen no-shows en personeelsplanners. [Bekijk Horeca](action:/solutions/horeca-hospitality)"
      : "For Horeca & Hospitality, we engineer commission-free booking engines, automatic SMS/WhatsApp no-show prevention, and shift planners. [View Horeca](action:/solutions/horeca-hospitality)"
  }
  if (q.includes('agency') || q.includes('marketing') || q.includes('report') || q.includes('client') || q.includes('bureau') || q.includes('ad')) {
    return isNl
      ? "Voor marketingbureaus automatiseren we maandelijks KPI-rapportages, client-onboarding en campagne-dashboards. [Bekijk Marketing Solutions](action:/solutions/marketing-agency)"
      : "For marketing agencies, we automate client reporting dashboards, onboarding workflows, and campaign tracking. [View Marketing Solutions](action:/solutions/marketing-agency)"
  }
  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('prijs') || q.includes('tarief') || q.includes('kosten') || q.includes('money')) {
    return isNl
      ? "Onze projecten zijn maatwerk en worden binnen 7 dagen sleutelklaar opgeleverd. Kleinere automatiseringen starten al vanaf een vast tarief. [Bereken je ROI](action:book)"
      : "Our custom automation projects are delivered turnkey in under 7 days. Smaller workflows start at flat rate pricing. [Calculate Your ROI](action:book)"
  }
  if (q.includes('contact') || q.includes('book') || q.includes('call') || q.includes('afspraak') || q.includes('bellen') || q.includes('phone') || q.includes('speak') || q.includes('talk')) {
    return isNl
      ? "U kunt direct een vrijblijvende strategie-call inplannen via onze online agenda: [Afspraak Inplannen](action:book) of stuur ons een bericht via [WhatsApp](action:whatsapp)."
      : "You can book a free 15-minute strategy call directly via our calendar: [Book a Call](action:book) or message us on [WhatsApp](action:whatsapp)."
  }

  // Default AI automation response
  return isNl
    ? "Bij AutoFlow Studio ontwerpen en bouwen we maatwerk automatiseringen, AI-agents en dashboard-systemen die in minder dan 7 dagen live gaan. Waar kan ik u mee helpen? [Plan een gratis Discovery Call](action:book)"
    : "At AutoFlow Studio, we design and deploy custom business automations, AI agents, and internal portals in under 7 days. What can I help you automate today? [Book a Free Discovery Call](action:book)"
}

