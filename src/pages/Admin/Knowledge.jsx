import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function AdminKnowledge() {
  const { user } = useAdmin()
  const [activeTab, setActiveTab] = useState('kb') // 'kb' or 'tree'
  
  // ── 1. Documents KB State ────────────────────────────────────────────────
  const [knowledgeList, setKnowledgeList] = useState([])
  const [loadingKb, setLoadingKb] = useState(true)
  const [savingKb, setSavingKb] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [uploadError, setUploadError] = useState('')

  // ── 2. Configurable Response Tree State ───────────────────────────────────
  const [treeList, setTreeList] = useState([])
  const [loadingTree, setLoadingTree] = useState(true)
  const [savingTree, setSavingTree] = useState(false)
  const [triggerWord, setTriggerWord] = useState('')
  const [responseText, setResponseText] = useState('')
  const [lang, setLang] = useState('en')
  const [editingTreeId, setEditingTreeId] = useState(null)

  useEffect(() => {
    fetchKnowledge()
    fetchTree()
  }, [])

  // =========================================================================
  // DOCUMENTS KB LOGIC
  // =========================================================================

  async function fetchKnowledge() {
    setLoadingKb(true)
    try {
      const { data, error } = await supabase
        .from('company_knowledge')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setKnowledgeList(data)
      }
    } catch (err) {
      console.error('Error loading knowledge base:', err)
    } finally {
      setLoadingKb(false)
    }
  }

  function csvToMarkdown(csvText) {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length === 0) return ''

    const parseCsvRow = (text) => {
      const result = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCsvRow(lines[0])
    let markdown = `| ${headers.join(' | ')} |\n`
    markdown += `| ${headers.map(() => '---').join(' | ')} |\n`

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvRow(lines[i])
      const paddedRow = row.concat(Array(Math.max(0, headers.length - row.length)).fill(''))
      markdown += `| ${paddedRow.slice(0, headers.length).join(' | ')} |\n`
    }

    return markdown
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text !== 'string') return

      const filename = file.name
      const cleanTitle = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      
      setTitle(cleanTitle)
      
      if (filename.endsWith('.csv')) {
        const mdTable = csvToMarkdown(text)
        setContent(mdTable)
      } else {
        setContent(text)
      }
    }

    reader.onerror = () => {
      setUploadError('Failed to read file')
    }

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file)
    } else {
      setUploadError('Unsupported file type. Please upload a .csv, .txt, or .md file.')
    }
  }

  const handleSaveKb = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || savingKb) return

    setSavingKb(true)
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      }

      let error
      if (editingId) {
        const res = await supabase
          .from('company_knowledge')
          .update(payload)
          .eq('id', editingId)
        error = res.error
      } else {
        const res = await supabase
          .from('company_knowledge')
          .insert([payload])
        error = res.error
      }

      if (error) throw error

      setTitle('')
      setContent('')
      setEditingId(null)
      fetchKnowledge()
    } catch (err) {
      alert('Failed to save document: ' + err.message)
    } finally {
      setSavingKb(false)
    }
  }

  const handleEditKb = (doc) => {
    setEditingId(doc.id)
    setTitle(doc.title)
    setContent(doc.content)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteKb = async (id) => {
    if (!confirm('Are you sure you want to delete this document from the knowledge base?')) return

    try {
      const { error } = await supabase
        .from('company_knowledge')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchKnowledge()
    } catch (err) {
      alert('Failed to delete document: ' + err.message)
    }
  }

  // =========================================================================
  // CONFIGURABLE RESPONSE TREE LOGIC
  // =========================================================================

  async function fetchTree() {
    setLoadingTree(true)
    try {
      const { data, error } = await supabase
        .from('chatbot_response_tree')
        .select('*')
        .order('trigger_word', { ascending: true })
      if (!error && data) {
        setTreeList(data)
      }
    } catch (err) {
      console.error('Error loading response tree:', err)
    } finally {
      setLoadingTree(false)
    }
  }

  const handleSaveTree = async (e) => {
    e.preventDefault()
    if (!triggerWord.trim() || !responseText.trim() || savingTree) return

    setSavingTree(true)
    try {
      const payload = {
        trigger_word: triggerWord.trim().toLowerCase(),
        response_text: responseText.trim(),
        lang
      }

      let error
      if (editingTreeId) {
        const res = await supabase
          .from('chatbot_response_tree')
          .update(payload)
          .eq('id', editingTreeId)
        error = res.error
      } else {
        const res = await supabase
          .from('chatbot_response_tree')
          .insert([payload])
        error = res.error
      }

      if (error) throw error

      setTriggerWord('')
      setResponseText('')
      setLang('en')
      setEditingTreeId(null)
      fetchTree()
    } catch (err) {
      alert('Failed to save response rule: ' + err.message)
    } finally {
      setSavingTree(false)
    }
  }

  const handleEditTree = (rule) => {
    setEditingTreeId(rule.id)
    setTriggerWord(rule.trigger_word)
    setResponseText(rule.response_text)
    setLang(rule.lang)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteTree = async (id) => {
    if (!confirm('Are you sure you want to delete this trigger rule?')) return

    try {
      const { error } = await supabase
        .from('chatbot_response_tree')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchTree()
    } catch (err) {
      alert('Failed to delete rule: ' + err.message)
    }
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            Chatbot Knowledge Base
          </h1>
          <p style={{ color: '#94A3B8' }}>
            Configure the sources of knowledge and triggers for the client AI Chatbot widget.
          </p>
        </div>

        {/* Tab Switcher Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <button
            onClick={() => setActiveTab('kb')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: activeTab === 'kb' ? 'linear-gradient(135deg, #d1bbfb, #5646e4)' : 'rgba(255,255,255,0.03)',
              border: activeTab === 'kb' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            Documents & Tables KB
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: activeTab === 'tree' ? 'linear-gradient(135deg, #d1bbfb, #5646e4)' : 'rgba(255,255,255,0.03)',
              border: activeTab === 'tree' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            Configurable Response Tree
          </button>
        </div>

        {/* ===================================================================
            TAB: DOCUMENTS KB EDITOR
            =================================================================== */}
        {activeTab === 'kb' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Editor Form card */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px' }}>
                {editingId ? 'Edit Document' : 'Add New Document'}
              </h2>

              <form onSubmit={handleSaveKb} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {!editingId && (
                  <div>
                    <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Upload File (CSV, TXT, MD)
                    </label>
                    <div style={{
                      border: '1px dashed rgba(255,255,255,0.15)',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="file"
                        accept=".csv,.txt,.md"
                        onChange={handleFileUpload}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ marginBottom: '8px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                      </svg>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                        Drag and drop or click to upload
                      </p>
                    </div>
                    {uploadError && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px', margin: 0 }}>{uploadError}</p>
                    )}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Services Pricing Guide"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Document Content
                  </label>
                  <textarea
                    required
                    rows="12"
                    placeholder="Paste details here..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      fontFamily: 'monospace',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingKb}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: savingKb ? 0.6 : 1
                    }}
                  >
                    {savingKb ? 'Saving...' : editingId ? 'Update Document' : 'Save Document'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setTitle('')
                        setContent('')
                      }}
                      style={{
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List panel */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px' }}>
                Knowledge Base Documents ({knowledgeList.length})
              </h2>

              {loadingKb ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                  Loading documents...
                </div>
              ) : knowledgeList.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748B', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No documents loaded</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {knowledgeList.map(doc => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                          Size: {doc.content.length.toLocaleString()} chars
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditKb(doc)}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            color: '#A78BFA',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteKb(doc.id)}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            color: '#F87171',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: CONFIGURABLE RESPONSE TREE
            =================================================================== */}
        {activeTab === 'tree' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Tree Trigger rule Form card */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px' }}>
                {editingTreeId ? 'Edit Trigger Rule' : 'Add Trigger Rule'}
              </h2>

              <form onSubmit={handleSaveTree} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Trigger word */}
                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Trigger Word / Phrase
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pricing"
                    value={triggerWord}
                    onChange={e => setTriggerWord(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', marginTop: '6px' }}>
                    Matched case-insensitively when user message contains or matches this word.
                  </span>
                </div>

                {/* Language selection dropdown */}
                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Language
                  </label>
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="en" style={{ background: '#0a0a0a' }}>English (EN)</option>
                    <option value="nl" style={{ background: '#0a0a0a' }}>Dutch (NL)</option>
                  </select>
                </div>

                {/* Response Text */}
                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Instant Response Text
                  </label>
                  <textarea
                    required
                    rows="8"
                    placeholder="Enter instant answer. Support buttons using: [Label](action:book) or [Label](action:portfolio)"
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', marginTop: '6px' }}>
                    Use standard markdown like **bold** or lists. Include buttons via `[Book a Call](action:book)`, `[WhatsApp](action:whatsapp)` or `/portfolio`.
                  </span>
                </div>

                {/* Save Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingTree}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: savingTree ? 0.6 : 1
                    }}
                  >
                    {savingTree ? 'Saving...' : editingTreeId ? 'Update Rule' : 'Save Rule'}
                  </button>
                  {editingTreeId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTreeId(null)
                        setTriggerWord('')
                        setResponseText('')
                        setLang('en')
                      }}
                      style={{
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Configured triggers list */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px' }}>
                Configured Rules ({treeList.length})
              </h2>

              {loadingTree ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                  Loading rules...
                </div>
              ) : treeList.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748B', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No trigger rules configured</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>Define trigger phrases to respond instantly without API fetches.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {treeList.map(rule => (
                    <div
                      key={rule.id}
                      style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{
                            padding: '2px 8px',
                            background: rule.lang === 'en' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: rule.lang === 'en' ? '#60A5FA' : '#F59E0B',
                            borderRadius: '8px',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            textTransform: 'uppercase'
                          }}>
                            {rule.lang.toUpperCase()}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rule.trigger_word}
                          </h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rule.response_text}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditTree(rule)}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            color: '#A78BFA',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTree(rule.id)}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            color: '#F87171',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
