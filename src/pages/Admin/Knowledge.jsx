import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function AdminKnowledge() {
  const { user } = useAdmin()
  const [knowledgeList, setKnowledgeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [uploadError, setUploadError] = useState('')
  
  useEffect(() => {
    fetchKnowledge()
  }, [])

  async function fetchKnowledge() {
    setLoading(true)
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
      setLoading(false)
    }
  }

  // Simple CSV to Markdown Table converter
  function csvToMarkdown(csvText) {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length === 0) return ''

    // Helper to parse CSV row (handles quotes)
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
      // Match columns count with headers
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
      
      // Auto-populate form
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

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || saving) return

    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      }

      let error
      if (editingId) {
        // Update
        const res = await supabase
          .from('company_knowledge')
          .update(payload)
          .eq('id', editingId)
        error = res.error
      } else {
        // Insert
        const res = await supabase
          .from('company_knowledge')
          .insert([payload])
        error = res.error
      }

      if (error) throw error

      // Reset form
      setTitle('')
      setContent('')
      setEditingId(null)
      
      // Refresh list
      fetchKnowledge()
    } catch (err) {
      alert('Failed to save document: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (doc) => {
    setEditingId(doc.id)
    setTitle(doc.title)
    setContent(doc.content)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
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

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            Chatbot Knowledge Base
          </h1>
          <p style={{ color: '#94A3B8' }}>
            Upload company data tables, pricing details, and FAQs. The AI Chatbot uses these documents as context to answer customer queries.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Document Editor Form */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px' }}>
              {editingId ? 'Edit Document' : 'Add New Document'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* File Upload Zone */}
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
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      CSV files auto-convert to Markdown tables
                    </span>
                  </div>
                  {uploadError && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px', margin: 0 }}>{uploadError}</p>
                  )}
                </div>
              )}

              {/* Title input */}
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

              {/* Content text */}
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Document Content
                </label>
                <textarea
                  required
                  rows="12"
                  placeholder="Paste table data or description details here..."
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

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #d1bbfb 0%, #5646e4 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Saving...' : editingId ? 'Update Document' : 'Save Document'}
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

          {/* Documents Table */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px' }}>
              Knowledge Base entries ({knowledgeList.length})
            </h2>

            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
                Loading knowledge documents...
              </div>
            ) : knowledgeList.length === 0 ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748B', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No documents loaded</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>Upload a file or create a document to get started.</p>
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
                        Modified: {new Date(doc.updated_at).toLocaleDateString([], { dateStyle: 'medium' })} | Size: {doc.content.length.toLocaleString()} characters
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(doc)}
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
                        onClick={() => handleDelete(doc.id)}
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

      </div>
    </AdminLayout>
  )
}
