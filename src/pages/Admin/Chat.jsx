import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function AdminChat() {
  const { user, profile } = useAdmin()
  const [profiles, setProfiles] = useState([])
  const [activeTarget, setActiveTarget] = useState(null) // null = # general
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(true)

  const messagesEndRef = useRef(null)

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

  // Subscribe to real-time message insertions
  useEffect(() => {
    if (!user?.id) return
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
  }, [user?.id, activeTarget, fetchMessages])

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loadingMessages])

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

  return (
    <AdminLayout>
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 150px)',
        background: '#0a0a0a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
      }}>
        
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
                background: activeTarget === null ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: activeTarget === null ? 'white' : '#94A3B8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontWeight: activeTarget === null ? 700 : 600
              }}
              onMouseOver={e => { if (activeTarget !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseOut={e => { if (activeTarget !== null) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '1.1rem', color: activeTarget === null ? '#f06292' : '#64748B' }}>#</span>
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
                      background: isActive ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      color: isActive ? 'white' : '#CBD5E1',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      fontWeight: isActive ? 700 : 600
                    }}
                    onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* User Initials Circle */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: p.role === 'admin' ? 'linear-gradient(135deg, #e91e63, #9c27b0)' : p.role === 'Napoleon' ? 'linear-gradient(135deg, #a855f7, #e91e63)' : 'linear-gradient(135deg, #3b82f6, #10b981)',
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
                      <p style={{ margin: 0, fontSize: '0.65rem', color: p.role === 'admin' ? '#f06292' : p.role === 'Napoleon' ? '#c084fc' : '#4ade80', textTransform: 'uppercase', fontWeight: 800 }}>
                        {p.role}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Messaging Area */}
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
            <span style={{ fontSize: '1.25rem', color: '#f06292', fontWeight: 800 }}>
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
                    {/* Sender Label (Group Chat only) */}
                    {activeTarget === null && !isMine && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: senderProf?.role === 'admin' ? '#f06292' : senderProf?.role === 'Napoleon' ? '#c084fc' : '#4ade80',
                        marginBottom: '4px',
                        marginLeft: '12px'
                      }}>
                        {senderName} ({senderProf?.role || 'salesperson'})
                      </span>
                    )}

                    {/* Message Bubble */}
                    <div style={{
                      background: isMine ? 'linear-gradient(135deg, #e91e63, #9c27b0)' : 'rgba(255,255,255,0.04)',
                      color: 'white',
                      padding: '12px 18px',
                      borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      border: isMine ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isMine ? '0 4px 15px rgba(233, 30, 99, 0.15)' : 'none',
                      position: 'relative'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </p>
                    </div>

                    {/* Timestamp */}
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

          {/* Input Panel */}
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
              onFocus={e => e.currentTarget.style.border = '1px solid rgba(233, 30, 99, 0.4)'}
              onBlur={e => e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)'}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
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
              onMouseOver={e => { if (inputText.trim() && !sending) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseOut={e => { if (inputText.trim() && !sending) e.currentTarget.style.transform = 'none' }}
            >
              Send
            </button>
          </form>

        </div>
      </div>
    </AdminLayout>
  )
}
