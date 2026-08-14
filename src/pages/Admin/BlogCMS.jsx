import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import { useAdmin } from '../../components/Admin/AdminContext'

export default function AdminBlogCMS() {
  const { user } = useAdmin()
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'editor' | 'images'
  
  // Blog posts states
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [savingPost, setSavingPost] = useState(false)

  // Editor states
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [lang, setLang] = useState('en')
  const [desc, setDesc] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [body, setBody] = useState('')
  const [faqs, setFaqs] = useState([])

  // Image Upload States
  const [imagesList, setImagesList] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const bodyEditorRef = useRef(null)

  useEffect(() => {
    fetchPosts()
    fetchImages()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generatedSlug)
    }
  }, [title, editingId])

  // Prefill publish date with current Month Year (e.g. "August 2026")
  useEffect(() => {
    if (!editingId && !publishDate) {
      const now = new Date()
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      const monthsNl = [
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
      ]
      const monthStr = lang === 'nl' ? monthsNl[now.getMonth()] : months[now.getMonth()]
      setPublishDate(`${monthStr} ${now.getFullYear()}`)
    }
  }, [lang, editingId])

  // =========================================================================
  // POSTS LOGIC
  // =========================================================================
  async function fetchPosts() {
    setLoadingPosts(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleSavePost = async (e) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !body.trim() || savingPost) return

    setSavingPost(true)
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        lang,
        desc_text: desc.trim(),
        publish_date: publishDate.trim(),
        body: body.trim(),
        faqs: faqs.filter(f => f.q.trim() && f.a.trim()),
        updated_at: new Date().toISOString()
      }

      let error
      if (editingId) {
        const res = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', editingId)
        error = res.error
      } else {
        const res = await supabase
          .from('blog_posts')
          .insert([payload])
        error = res.error
      }

      if (error) throw error

      resetEditor()
      setActiveTab('list')
      fetchPosts()
    } catch (err) {
      alert('Failed to save blog post: ' + err.message)
    } finally {
      setSavingPost(false)
    }
  }

  const handleEditPost = (post) => {
    setEditingId(post.id)
    setTitle(post.title)
    setSlug(post.slug)
    setLang(post.lang)
    setDesc(post.desc_text)
    setPublishDate(post.publish_date)
    setBody(post.body)
    setFaqs(post.faqs || [])
    setActiveTab('editor')
  }

  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchPosts()
    } catch (err) {
      alert('Failed to delete blog post: ' + err.message)
    }
  }

  const resetEditor = () => {
    setEditingId(null)
    setTitle('')
    setSlug('')
    setDesc('')
    setPublishDate('')
    setBody('')
    setFaqs([])
  }

  // =========================================================================
  // FAQS LOGIC
  // =========================================================================
  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }])
  }

  const handleFaqChange = (index, field, value) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  // =========================================================================
  // IMAGES LOGIC
  // =========================================================================
  async function fetchImages() {
    setLoadingImages(true)
    try {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      
      if (error) throw error

      if (data) {
        const formatted = data.map(item => {
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(item.name)
          return {
            name: item.name,
            url: publicUrl,
            metadata: item.metadata
          }
        })
        setImagesList(formatted)
      }
    } catch (err) {
      console.error('Error listing blog images:', err)
    } finally {
      setLoadingImages(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setUploadError('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`
      
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file)

      if (error) throw error

      fetchImages()
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async (name) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      const { error } = await supabase.storage
        .from('blog-images')
        .remove([name])
      if (error) throw error
      fetchImages()
    } catch (err) {
      alert('Failed to delete image: ' + err.message)
    }
  }

  const copyToClipboard = (text, message = 'Copied!') => {
    navigator.clipboard.writeText(text).then(() => {
      alert(message)
    })
  }

  // Helper to insert tags into the HTML body editor
  const insertHtmlTag = (before, after) => {
    const textarea = bodyEditorRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    const newBody = text.substring(0, start) + replacement + text.substring(end)
    setBody(newBody)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: activeTab === 'list' ? 'rgba(209, 187, 251, 0.15)' : 'transparent',
              color: activeTab === 'list' ? '#d1bbfb' : '#94A3B8',
              border: activeTab === 'list' ? '1px solid rgba(209, 187, 251, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}>
            All Blog Posts
          </button>
          <button 
            onClick={() => {
              if (activeTab !== 'editor') resetEditor()
              setActiveTab('editor')
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: activeTab === 'editor' ? 'rgba(209, 187, 251, 0.15)' : 'transparent',
              color: activeTab === 'editor' ? '#d1bbfb' : '#94A3B8',
              border: activeTab === 'editor' ? '1px solid rgba(209, 187, 251, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}>
            {editingId ? 'Edit Post' : 'New Post'}
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: activeTab === 'images' ? 'rgba(209, 187, 251, 0.15)' : 'transparent',
              color: activeTab === 'images' ? '#d1bbfb' : '#94A3B8',
              border: activeTab === 'images' ? '1px solid rgba(209, 187, 251, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}>
            Image Manager
          </button>
        </div>

        {/* =========================================================================
            1. POSTS LIST TAB
            ========================================================================= */}
        {activeTab === 'list' && (
          <div>
            {loadingPosts ? (
              <div style={{ color: '#94A3B8', textAlign: 'center', padding: '40px' }}>Loading blog posts...</div>
            ) : posts.length === 0 ? (
              <div style={{ 
                background: '#0F1115', 
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: '16px', 
                padding: '48px', 
                textAlign: 'center', 
                color: '#94A3B8' 
              }}>
                <h3>No dynamic blog posts found</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Create your first dynamic blog post in the Database using the CMS.</p>
                <button 
                  onClick={() => setActiveTab('editor')}
                  style={{
                    background: '#d1bbfb',
                    color: '#050505',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  Create New Post
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {posts.map(post => (
                  <div key={post.id} style={{
                    background: '#0F1115',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ 
                          background: 'rgba(209, 187, 251, 0.12)', 
                          border: '1px solid rgba(209, 187, 251, 0.3)', 
                          color: '#d1bbfb', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.7rem', 
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {post.lang}
                        </span>
                        <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{post.publish_date}</span>
                      </div>
                      <h3 style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>{post.title}</h3>
                      <code style={{ color: '#d1bbfb', fontSize: '0.8rem' }}>/{post.lang === 'nl' ? 'nl/' : ''}blog/{post.slug}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleEditPost(post)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F8FAFC',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#EF4444',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            2. EDITOR TAB (CREATE / EDIT FORM)
            ========================================================================= */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Title & Slug */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required
                  style={{
                    background: '#0F1115',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Slug (URL path) *</label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                  required
                  style={{
                    background: '#0F1115',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Language Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Language *</label>
                <select 
                  value={lang} 
                  onChange={e => setLang(e.target.value)}
                  style={{
                    background: '#0F1115',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}>
                  <option value="en">English (default)</option>
                  <option value="nl">Dutch (nl)</option>
                </select>
              </div>
              
              {/* Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Publish Date *</label>
                <input 
                  type="text" 
                  value={publishDate} 
                  onChange={e => setPublishDate(e.target.value)} 
                  required
                  placeholder="e.g. August 2026"
                  style={{
                    background: '#0F1115',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Meta Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Meta Description (Short card preview summary) *</label>
              <textarea 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                required
                rows={2}
                style={{
                  background: '#0F1115',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Split Pane: Editor and Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', minHeight: '400px', flexWrap: 'wrap' }}>
              
              {/* Left Pane: HTML Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>HTML Body Content *</label>
                  
                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => insertHtmlTag('<p>', '</p>')} style={toolbarBtnStyle} title="Paragraph">P</button>
                    <button type="button" onClick={() => insertHtmlTag('<strong>', '</strong>')} style={toolbarBtnStyle} title="Bold">B</button>
                    <button type="button" onClick={() => insertHtmlTag('<h2>', '</h2>')} style={toolbarBtnStyle} title="H2 Heading">H2</button>
                    <button type="button" onClick={() => insertHtmlTag('<h3>', '</h3>')} style={toolbarBtnStyle} title="H3 Heading">H3</button>
                    <button type="button" onClick={() => insertHtmlTag('<ul>\n  <li>', '</li>\n</ul>')} style={toolbarBtnStyle} title="Unordered List">UL</button>
                    <button type="button" onClick={() => insertHtmlTag('<div class="highlight-box"><h3>', '</h3><p></p></div>')} style={toolbarBtnStyle} title="Highlight Box">Box</button>
                    <button type="button" onClick={() => insertHtmlTag('<a href="">', '</a>')} style={toolbarBtnStyle} title="Anchor Link">Link</button>
                  </div>
                </div>
                
                <textarea 
                  id="body-editor"
                  ref={bodyEditorRef}
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  required
                  rows={20}
                  placeholder="Type your HTML here... Use <img src='...' /> to insert images uploaded in the Image Manager tab."
                  style={{
                    background: '#0B0D10',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#CBD5E1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    width: '100%'
                  }}
                />
              </div>

              {/* Right Pane: Live styled Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Live Styled Preview</label>
                <div style={{
                  background: '#050505',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '24px',
                  overflowY: 'auto',
                  maxHeight: '445px',
                  minHeight: '445px'
                }}>
                  <style>{`
                    .preview-body { color: #CBD5E1; font-size: 0.95rem; line-height: 1.8; }
                    .preview-body h1,.preview-body h2,.preview-body h3,.preview-body h4 { color: #F8FAFC; margin: 1.5em 0 0.5em; font-weight: 700; }
                    .preview-body h2 { font-size: 1.35rem; } .preview-body h3 { font-size: 1.15rem; }
                    .preview-body p { margin-bottom: 1.2em; }
                    .preview-body ul,.preview-body ol { margin: 1em 0 1.2em 1.5em; }
                    .preview-body li { margin-bottom: 0.4em; }
                    .preview-body img { width: 100%; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(255, 255, 255, 0.08); }
                    .preview-body .highlight-box { background: rgba(209, 187, 251, 0.05); border-left: 3px solid #d1bbfb; padding: 20px; border-radius: 8px; margin: 24px 0; }
                    .preview-body .highlight-box h3 { color: #d1bbfb; margin-top: 0; }
                  `}</style>
                  <div className="preview-body" dangerouslySetInnerHTML={{ __html: body || '<p style="color: #64748B; font-style: italic;">HTML output preview will display here...</p>' }} />
                </div>
              </div>
            </div>

            {/* FAQs Section */}
            <div style={{
              background: '#0F1115',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.05rem', fontWeight: 700 }}>Frequently Asked Questions (JSON-LD FAQPage Integration)</h3>
                <button 
                  type="button" 
                  onClick={handleAddFaq}
                  style={{
                    background: 'rgba(209, 187, 251, 0.12)',
                    border: '1px solid rgba(209, 187, 251, 0.3)',
                    color: '#d1bbfb',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                  + Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>No FAQs added. Dynamic posts with FAQs automatically get Google Rich Results Schema metadata!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {faqs.map((faq, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>FAQ #{idx + 1}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFaq(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}>
                          Remove
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Question" 
                        value={faq.q} 
                        onChange={e => handleFaqChange(idx, 'q', e.target.value)}
                        style={{
                          background: '#0B0D10',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: 'white',
                          fontSize: '0.9rem'
                        }}
                      />
                      <textarea 
                        placeholder="Answer" 
                        value={faq.a} 
                        onChange={e => handleFaqChange(idx, 'a', e.target.value)}
                        rows={2}
                        style={{
                          background: '#0B0D10',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: '#CBD5E1',
                          fontSize: '0.9rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => {
                  resetEditor()
                  setActiveTab('list')
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={savingPost}
                style={{
                  background: '#d1bbfb',
                  color: '#050505',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: savingPost ? 0.6 : 1
                }}>
                {savingPost ? 'Saving...' : 'Save Blog Post'}
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            3. IMAGES LIST TAB
            ========================================================================= */}
        {activeTab === 'images' && (
          <div>
            {/* File Upload Zone */}
            <div style={{
              background: '#0F1115',
              border: '2px dashed rgba(209, 187, 251, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '32px',
              position: 'relative'
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1bbfb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <h4 style={{ margin: '0 0 8px', color: '#F8FAFC' }}>
                {uploadingImage ? 'Uploading Image...' : 'Drag & Drop or Click to Upload Image'}
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>Supports PNG, JPEG, WEBP, GIF up to 5MB</p>
              {uploadError && <p style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '12px' }}>{uploadError}</p>}
            </div>

            {/* Images Grid */}
            {loadingImages ? (
              <div style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>Loading images gallery...</div>
            ) : imagesList.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '0.9rem', textAlign: 'center', padding: '40px' }}>No uploaded images found. Upload some to insert in your blog posts.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {imagesList.map((img, idx) => (
                  <div key={idx} style={{
                    background: '#0F1115',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}>
                    <div style={{ height: '140px', overflow: 'hidden', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={img.url} alt={img.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <span style={{ 
                        color: '#64748B', 
                        fontSize: '0.75rem', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {img.name}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                        <button 
                          onClick={() => copyToClipboard(`<img src="${img.url}" alt="" />`, 'Copied HTML Tag to clipboard!')}
                          style={actionBtnStyle}>
                          Copy Tag
                        </button>
                        <button 
                          onClick={() => copyToClipboard(img.url, 'Copied Image URL!')}
                          style={actionBtnStyle}>
                          Copy URL
                        </button>
                        <button 
                          onClick={() => handleDeleteImage(img.name)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#EF4444',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            flex: 1
                          }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

const toolbarBtnStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#CBD5E1',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.15s'
}

const actionBtnStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#CBD5E1',
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: 600,
  flex: 1,
  transition: 'all 0.15s'
}
