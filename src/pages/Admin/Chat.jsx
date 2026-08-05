import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function AdminChat() {
  const { user, profile } = useAdmin()
  const [activeSection, setActiveSection] = useState('team') // 'team' or 'customers'
  
  // ── 1. Team Messaging State ──────────────────────────────────────────────
  const [profiles, setProfiles] = useState([])
  const [activeTarget, setActiveTarget] = useState(null) // null = # general
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const messagesEndRef = useRef(null)

  // ── 2. Customer Live Chat State ──────────────────────────────────────────
  const [customerChats, setCustomerChats] = useState([])
  const [activeCustomerChat, setActiveCustomerChat] = useState(null)
  const [customerMessages, setCustomerMessages] = useState([])
  const [inputCustomerText, setInputCustomerText] = useState('')
  const [loadingCustomerChats, setLoadingCustomerChats] = useState(true)
  const [loadingCustomerMessages, setLoadingCustomerMessages] = useState(false)
  const customerMessagesEndRef = useRef(null)

  // =========================================================================
  // TEAM MESSAGES LOGIC
  // =========================================================================

  // Fetch all profiles except current user for direct messages
  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name')
      if (!error && data) {
        setProfiles(data.filter(p => p.id !== user?.id))
      }
    }
    if (user?.id) {
      loadProfiles()
    }
  }, [user?.id])

  // Fetch messages for the active conversation
  const fetchMessages = useCallback(async () => {
    if (!user?.id) return
    setLoadingMessages(true)
    try {
      let query = supabase.from('chat_messages').select('*')
      if (activeTarget === null) {
        query = query.is('receiver_id', null)
      } else {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeTarget.id}),and(sender_id.eq.${activeTarget.id},receiver_id.eq.${user.id})`)
      }
      const { data, error } = await query
        .order('created_at', { ascending: true })
        .limit(100)
      if (!error && data) {
        setMessages(data)
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [user?.id, activeTarget])

  // Subscribe to real-time message insertions for team messages
  useEffect(() => {
    if (!user?.id || activeSection !== 'team') return
    fetchMessages()

    const channel = supabase
      .channel('chat-messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        const newMsg = payload.new
        // Append message if it belongs to current active view
        if (activeTarget === null) {
          if (newMsg.receiver_id === null) {
            setMessages(prev => [...prev, newMsg])
          }
        } else {
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === activeTarget.id) ||
            (newMsg.sender_id === activeTarget.id && newMsg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, newMsg])
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, activeTarget, fetchMessages, activeSection])

  // Scroll team chat to bottom
  useEffect(() => {
    if (activeSection === 'team') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loadingMessages, activeSection])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || sending || !user?.id) return
    setSending(true)
    try {
      const { error } = await supabase.from('chat_messages').insert({
        sender_id: user.id,
        receiver_id: activeTarget ? activeTarget.id : null,
        content: inputText.trim()
      })
      if (error) {
        alert('Failed to send message: ' + error.message)
      } else {
        setInputText('')
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const getSenderProfile = (senderId) => {
    if (senderId === user?.id) return profile
    return profiles.find(p => p.id === senderId)
  }

  // =========================================================================
  // CUSTOMER LIVE CHAT LOGIC
  // =========================================================================

  const loadCustomerChats = async () => {
    setLoadingCustomerChats(true)
    try {
      const { data, error } = await supabase
        .from('customer_chats')
        .select('*')
        .order('updated_at', { ascending: false })
      if (!error && data) {
        setCustomerChats(data)
      }
    } catch (err) {
      console.error('Error loading customer chats:', err)
    } finally {
      setLoadingCustomerChats(false)
    }
  }

  const loadCustomerMessages = async (chatId) => {
    setLoadingCustomerMessages(true)
    try {
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      if (!error && data) {
        setCustomerMessages(data)
      }
    } catch (err) {
      console.error('Error loading customer messages:', err)
    } finally {
      setLoadingCustomerMessages(false)
    }
  }

  // Fetch customer chats list and subscribe to updates
  useEffect(() => {
    if (activeSection === 'customers') {
      loadCustomerChats()

      const channel = supabase
        .channel('customer-chats-list-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'customer_chats'
        }, () => {
          loadCustomerChats()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [activeSection])

  // Watch for active customer messages
  useEffect(() => {
    if (activeSection === 'customers' && activeCustomerChat?.id) {
      loadCustomerMessages(activeCustomerChat.id)

      const channel = supabase
        .channel(`customer-messages-${activeCustomerChat.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_messages'
        }, (payload) => {
          if (payload.new.chat_id === activeCustomerChat.id) {
            setCustomerMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev
              return [...prev, payload.new]
            })
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [activeSection, activeCustomerChat?.id])

  // Scroll customer messages to bottom
  useEffect(() => {
    if (activeSection === 'customers') {
      customerMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [customerMessages, loadingCustomerMessages, activeSection])

  const handleSendCustomerMessage = async (e) => {
    e.preventDefault()
    if (!inputCustomerText.trim() || sending || !activeCustomerChat) return
    setSending(true)
    try {
      const text = inputCustomerText.trim()
      setInputCustomerText('')

      const { error } = await supabase.from('customer_messages').insert({
        chat_id: activeCustomerChat.id,
        sender_type: 'human',
        sender_id: user.id,
        content: text
      })

      if (error) {
        alert('Failed to send: ' + error.message)
      } else {
        // If chat status was not 'human' or not assigned to current user, auto take over
        if (activeCustomerChat.status !== 'human' || activeCustomerChat.assigned_to !== user.id) {
          await supabase
            .from('customer_chats')
            .update({
              status: 'human',
              assigned_to: user.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', activeCustomerChat.id)
          
          setActiveCustomerChat(prev => ({
            ...prev,
            status: 'human',
            assigned_to: user.id
          }))
          loadCustomerChats()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleTakeOverChat = async () => {
    if (!activeCustomerChat) return
    try {
      const { error } = await supabase
        .from('customer_chats')
        .update({
          status: 'human',
          assigned_to: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeCustomerChat.id)
      
      if (!error) {
        setActiveCustomerChat(prev => ({ ...prev, status: 'human', assigned_to: user.id }))
        loadCustomerChats()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleTransferToBot = async () => {
    if (!activeCustomerChat) return
    try {
      const { error } = await supabase
        .from('customer_chats')
        .update({
          status: 'bot',
          assigned_to: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeCustomerChat.id)
      
      if (!error) {
        setActiveCustomerChat(prev => ({ ...prev, status: 'bot', assigned_to: null }))
        loadCustomerChats()

        // Send confirmation message to customer that bot is handling it again
        await supabase.from('customer_messages').insert({
          chat_id: activeCustomerChat.id,
          sender_type: 'bot',
          content: 'I am back online! How can I help you next?'
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Pre-calculate if any customer chat needs attention
  const hasPendingTakeover = customerChats.some(chat => chat.status === 'needs_human')

  return (
    <AdminLayout>
      <style>{`
        @keyframes pulse-notif {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.35); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.9; }
        }
        @keyframes attention-blink {
          0% { opacity: 0.5; background: #ef4444; }
          50% { opacity: 1; background: #ef4444; box-shadow: 0 0 12px #ef4444; }
          100% { opacity: 0.5; background: #ef4444; }
        }
        .attention-dot {
          animation: attention-blink 1.2s infinite;
        }
      `}</style>

      {/* Section Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveSection('team')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: activeSection === 'team' ? 'linear-gradient(135deg, #d1bbfb, #5646e4)' : 'rgba(255,255,255,0.03)',
            border: activeSection === 'team' ? 'none' : '1px solid rgba(255,255,255,0.08)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Team Discussion
        </button>
        <button
          onClick={() => setActiveSection('customers')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: activeSection === 'customers' ? 'linear-gradient(135deg, #d1bbfb, #5646e4)' : 'rgba(255,255,255,0.03)',
            border: activeSection === 'customers' ? 'none' : '1px solid rgba(255,255,255,0.08)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Customer Live Chat
          {hasPendingTakeover && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 8px #ef4444',
              animation: 'pulse-notif 1.5s infinite'
            }} />
          )}
        </button>
      </div>

      <div style={{
        display: 'flex',
        height: 'calc(100vh - 200px)',
        background: '#0a0a0a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
      }}>

        {/* ===================================================================
            SECTION: TEAM MESSAGES SIDEBAR & FEED
            =================================================================== */}
        {activeSection === 'team' && (
          <>
            {/* Conversations Sidebar */}
            <div style={{
              width: '300px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'white' }}>
                  Conversations
                </h3>
              </div>

              {/* List Wrapper */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Channels Section */}
                <p style={{ margin: '8px 16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Channels
                </p>
                <button
                  onClick={() => setActiveTarget(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: activeTarget === null ? 'rgba(209, 187, 251, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    color: activeTarget === null ? 'white' : '#94A3B8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    fontWeight: activeTarget === null ? 700 : 600,
                    outline: 'none'
                  }}
                  onMouseOver={e => { if (activeTarget !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseOut={e => { if (activeTarget !== null) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '1.1rem', color: activeTarget === null ? '#d1bbfb' : '#64748B' }}>#</span>
                  <span>general</span>
                </button>

                {/* Direct Messages Section */}
                <p style={{ margin: '20px 16px 8px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Direct Messages
                </p>
                {profiles.length === 0 ? (
                  <p style={{ margin: '8px 16px', fontSize: '0.8rem', color: '#64748B' }}>No other users registered</p>
                ) : (
                  profiles.map(p => {
                    const isActive = activeTarget && activeTarget.id === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveTarget(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 16px',
                          background: isActive ? 'rgba(209, 187, 251, 0.1)' : 'transparent',
                          border: 'none',
                          borderRadius: '12px',
                          color: isActive ? 'white' : '#CBD5E1',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          fontWeight: isActive ? 700 : 600,
                          outline: 'none'
                        }}
                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        {/* User Initials Circle */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: p.role === 'admin' ? 'linear-gradient(135deg, #d1bbfb, #5646e4)' : p.role === 'Napoleon' ? 'linear-gradient(135deg, #a855f7, #d1bbfb)' : 'linear-gradient(135deg, #3b82f6, #10b981)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: 'white',
                          flexShrink: 0
                        }}>
                          {(p.name || p.email).charAt(0).toUpperCase()}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name || p.email.split('@')[0]}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: p.role === 'admin' ? '#d1bbfb' : p.role === 'Napoleon' ? '#c084fc' : '#4ade80', textTransform: 'uppercase', fontWeight: 800 }}>
                            {p.role}
                          </p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Messaging Feed Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#050505'
            }}>
              {/* Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.25rem', color: '#d1bbfb', fontWeight: 800 }}>
                  {activeTarget === null ? '#' : '@'}
                </span>
                <div>
                  <h4 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                    {activeTarget === null ? 'general' : (activeTarget.name || activeTarget.email)}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                    {activeTarget === null ? 'Public shared team discussion channel' : `Direct Message (${activeTarget.role})`}
                  </p>
                </div>
              </div>

              {/* Messages Feed */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {loadingMessages ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                    Loading conversation logs...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', gap: '8px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span style={{ fontSize: '0.85rem' }}>No messages in this chat. Start typing below!</span>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === user?.id
                    const senderProf = getSenderProfile(msg.sender_id)
                    const senderName = isMine ? 'You' : (senderProf?.name || senderProf?.email?.split('@')[0] || 'Team Member')
                    const displayTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '65%'
                        }}
                      >
                        {activeTarget === null && !isMine && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: senderProf?.role === 'admin' ? '#d1bbfb' : senderProf?.role === 'Napoleon' ? '#c084fc' : '#4ade80',
                            marginBottom: '4px',
                            marginLeft: '12px'
                          }}>
                            {senderName} ({senderProf?.role || 'salesperson'})
                          </span>
                        )}

                        <div style={{
                          background: isMine ? 'linear-gradient(135deg, #d1bbfb, #5646e4)' : 'rgba(255,255,255,0.04)',
                          color: 'white',
                          padding: '12px 18px',
                          borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          border: isMine ? 'none' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isMine ? '0 4px 15px rgba(209, 187, 251, 0.15)' : 'none',
                          position: 'relative'
                        }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                          </p>
                        </div>

                        <span style={{
                          fontSize: '0.65rem',
                          color: '#64748B',
                          marginTop: '4px',
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          marginRight: isMine ? '8px' : '0',
                          marginLeft: !isMine ? '8px' : '0'
                        }}>
                          {displayTime}
                        </span>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  placeholder={activeTarget === null ? "Send a message to general channel..." : `Send direct message to ${activeTarget.name || activeTarget.email.split('@')[0]}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.border = '1px solid rgba(209, 187, 251, 0.4)'}
                  onBlur={e => e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)'}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  style={{
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #d1bbfb, #5646e4)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: (!inputText.trim() || sending) ? 0.5 : 1
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}

        {/* ===================================================================
            SECTION: CUSTOMER LIVE CHAT SIDEBAR & FEED
            =================================================================== */}
        {activeSection === 'customers' && (
          <>
            {/* Customer Chats Sidebar */}
            <div style={{
              width: '300px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'white' }}>
                  Customer Live Chats
                </h3>
              </div>

              {/* Chats List Wrapper */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {loadingCustomerChats ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: '0.82rem' }}>
                    Loading active sessions...
                  </div>
                ) : customerChats.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B', fontSize: '0.82rem' }}>
                    No customer chats found.
                  </div>
                ) : (
                  customerChats.map(chat => {
                    const isActive = activeCustomerChat && activeCustomerChat.id === chat.id
                    const lastUpdated = new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    
                    return (
                      <button
                        key={chat.id}
                        onClick={() => setActiveCustomerChat(chat)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '12px 16px',
                          background: isActive ? 'rgba(209, 187, 251, 0.1)' : 'transparent',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          outline: 'none',
                          position: 'relative'
                        }}
                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>
                            {chat.customer_name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                            {lastUpdated}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* Chat status labels */}
                          {chat.status === 'needs_human' && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#F87171',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}>
                              <span className="attention-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', display: 'inline-block' }} />
                              Needs Help
                            </span>
                          )}
                          {chat.status === 'human' && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#60A5FA',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}>
                              With Agent
                            </span>
                          )}
                          {chat.status === 'bot' && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34D399',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}>
                              Bot Replying
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Customer Message Feed Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#050505'
            }}>
              {activeCustomerChat ? (
                <>
                  {/* Header with Takeover actions */}
                  <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                        {activeCustomerChat.customer_name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                        Current status: {activeCustomerChat.status === 'bot' ? 'Chatbot automated responder' : activeCustomerChat.status === 'needs_human' ? 'Customer requested a human agent' : 'Human takeover active'}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeCustomerChat.status !== 'human' ? (
                        <button
                          onClick={handleTakeOverChat}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #d1bbfb, #5646e4)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Take Over Chat
                        </button>
                      ) : (
                        <button
                          onClick={handleTransferToBot}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            color: '#F87171',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Transfer to Bot
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Feed scroll area */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {loadingCustomerMessages ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                        Loading message logs...
                      </div>
                    ) : customerMessages.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                        No messages in this chat yet.
                      </div>
                    ) : (
                      customerMessages.map(msg => {
                        const isCustomer = msg.sender_type === 'customer'
                        const isBot = msg.sender_type === 'bot'
                        const displayTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                              maxWidth: '65%'
                            }}
                          >
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: isCustomer ? '#CBD5E1' : isBot ? '#34D399' : '#60A5FA',
                              marginBottom: '4px',
                              marginLeft: isCustomer ? '12px' : '0',
                              marginRight: !isCustomer ? '12px' : '0',
                              alignSelf: isCustomer ? 'flex-start' : 'flex-end'
                            }}>
                              {isCustomer ? 'Customer' : isBot ? 'Bot' : 'Agent'}
                            </span>

                            <div style={{
                              background: isCustomer 
                                ? 'rgba(255,255,255,0.04)' 
                                : isBot 
                                ? 'rgba(16, 185, 129, 0.08)' 
                                : 'linear-gradient(135deg, #d1bbfb, #5646e4)',
                              color: 'white',
                              padding: '12px 18px',
                              borderRadius: isCustomer ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                              border: isCustomer 
                                ? '1px solid rgba(255,255,255,0.06)' 
                                : isBot 
                                ? '1px solid rgba(16, 185, 129, 0.15)' 
                                : 'none',
                              boxShadow: (!isCustomer && !isBot) ? '0 4px 15px rgba(209, 187, 251, 0.15)' : 'none'
                            }}>
                              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                              </p>
                            </div>

                            <span style={{
                              fontSize: '0.65rem',
                              color: '#64748B',
                              marginTop: '4px',
                              alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                              marginLeft: isCustomer ? '8px' : '0',
                              marginRight: !isCustomer ? '8px' : '0'
                            }}>
                              {displayTime}
                            </span>
                          </div>
                        )
                      })
                    )}
                    <div ref={customerMessagesEndRef} />
                  </div>

                  {/* Customer Input Panel */}
                  <form
                    onSubmit={handleSendCustomerMessage}
                    style={{
                      padding: '24px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type a message. Sending will automatically take over the chat..."
                      value={inputCustomerText}
                      onChange={e => setInputCustomerText(e.target.value)}
                      disabled={sending}
                      style={{
                        flex: 1,
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        color: 'white',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                      onFocus={e => e.currentTarget.style.border = '1px solid rgba(209, 187, 251, 0.4)'}
                      onBlur={e => e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)'}
                    />
                    <button
                      type="submit"
                      disabled={!inputCustomerText.trim() || sending}
                      style={{
                        padding: '14px 24px',
                        background: 'linear-gradient(135deg, #d1bbfb, #5646e4)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: (!inputCustomerText.trim() || sending) ? 0.5 : 1
                      }}
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', gap: '8px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Select a customer live chat session from the list to take over.</span>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  )
}
