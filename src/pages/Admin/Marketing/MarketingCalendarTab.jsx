import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

export default function MarketingCalendarTab({ profile, user }) {
  const [platform, setPlatform] = useState('linkedin') // 'linkedin' | 'tiktok'
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [pillarFilter, setPillarFilter] = useState('all')

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  // Form State
  const [formDate, setFormDate] = useState('')
  const [formDateLabel, setFormDateLabel] = useState('')
  const [formDay, setFormDay] = useState('Monday')
  const [formAccount, setFormAccount] = useState('Company Page')
  const [formPillar, setFormPillar] = useState('Operational Debt')
  const [formFormat, setFormFormat] = useState('Long-form text')
  const [formHook, setFormHook] = useState('')
  const [formConcept, setFormConcept] = useState('')
  const [formCaption, setFormCaption] = useState('')
  const [formCta, setFormCta] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const isAdmin = profile?.role === 'admin' || profile?.role === 'Napoleon'

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketing_calendar_items')
        .select('*')
        .order('scheduled_date', { ascending: true, nullsFirst: false })
      if (!error && data) {
        setPosts(data)
      }
    } catch (err) {
      console.error('Error fetching calendar posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const [syncingCalendar, setSyncingCalendar] = useState(false)
  const syncLock = useRef(false)

  const syncGoogleCalendar = async (items = posts) => {
    if (syncLock.current || syncingCalendar || !isAdmin) return
    const postsToSync = items.filter(p => !p.google_event_id)
    if (postsToSync.length === 0) return

    syncLock.current = true
    setSyncingCalendar(true)
    try {
      for (const p of postsToSync) {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'create_marketing_event',
            platform: p.platform,
            scheduledDate: p.scheduled_date,
            dateLabel: p.date_label,
            dayOfWeek: p.day_of_week,
            account: p.account,
            pillar: p.pillar,
            format: p.format,
            hook: p.hook,
            conceptOrTopic: p.concept_or_topic,
            captionOrDestination: p.caption_or_destination,
            cta: p.cta,
            notes: p.notes
          }
        })
        if (!error && data?.eventId) {
          await supabase
            .from('marketing_calendar_items')
            .update({ google_event_id: data.eventId })
            .eq('id', p.id)
        }
      }
      const { data } = await supabase
        .from('marketing_calendar_items')
        .select('*')
        .order('scheduled_date', { ascending: true, nullsFirst: false })
      if (data) setPosts(data)
    } catch (err) {
      console.error('Error syncing content items to Google Calendar:', err)
    } finally {
      setSyncingCalendar(false)
      syncLock.current = false
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (posts.length > 0 && posts.some(p => !p.google_event_id) && isAdmin) {
      syncGoogleCalendar(posts)
    }
  }, [posts, isAdmin])

  const resetForm = () => {
    setFormDate('')
    setFormDateLabel('')
    setFormDay('Monday')
    setFormAccount('Company Page')
    setFormPillar('Operational Debt')
    setFormFormat('Long-form text')
    setFormHook('')
    setFormConcept('')
    setFormCaption('')
    setFormCta('')
    setFormNotes('')
  }

  const handleOpenEdit = (post) => {
    setSelectedPost(post)
    setFormDate(post.scheduled_date || '')
    setFormDateLabel(post.date_label || '')
    setFormDay(post.day_of_week || 'Monday')
    setFormAccount(post.account || 'Company Page')
    setFormPillar(post.pillar || 'Operational Debt')
    setFormFormat(post.format || 'Long-form text')
    setFormHook(post.hook || '')
    setFormConcept(post.concept_or_topic || '')
    setFormCaption(post.caption_or_destination || '')
    setFormCta(post.cta || '')
    setFormNotes(post.notes || '')
    setIsEditOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!isAdmin) return

    const newPost = {
      platform,
      scheduled_date: formDate || null,
      date_label: formDateLabel || (formDate ? new Date(formDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
      day_of_week: formDay,
      account: platform === 'linkedin' ? formAccount : null,
      pillar: formPillar,
      format: formFormat,
      hook: platform === 'tiktok' ? formHook : null,
      concept_or_topic: formConcept,
      caption_or_destination: formCaption,
      cta: formCta,
      notes: formNotes || null,
      google_event_id: null
    }

    try {
      // 1. Sync to Google Calendar
      const { data: gcalData, error: gcalError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'create_marketing_event',
          platform: newPost.platform,
          scheduledDate: newPost.scheduled_date,
          dateLabel: newPost.date_label,
          dayOfWeek: newPost.day_of_week,
          account: newPost.account,
          pillar: newPost.pillar,
          format: newPost.format,
          hook: newPost.hook,
          conceptOrTopic: newPost.concept_or_topic,
          captionOrDestination: newPost.caption_or_destination,
          cta: newPost.cta,
          notes: newPost.notes
        }
      })

      if (!gcalError && gcalData?.eventId) {
        newPost.google_event_id = gcalData.eventId
      }

      // 2. Insert into DB
      const { error } = await supabase
        .from('marketing_calendar_items')
        .insert(newPost)

      if (error) throw error

      // Log activity to Dashboard feed
      await supabase.from('lead_history').insert({
        lead_id: null,
        lead_type: 'marketing',
        event_type: 'marketing',
        content: `📝 Created ${platform === 'linkedin' ? 'LinkedIn' : 'TikTok'} post: "${formConcept.substring(0, 40)}${formConcept.length > 40 ? '...' : ''}" for ${newPost.date_label || formDay}`,
        admin_id: user?.id
      })

      setIsAddOpen(false)
      resetForm()
      fetchPosts()
    } catch (err) {
      alert('Error creating post: ' + err.message)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!isAdmin || !selectedPost) return

    const updatedPost = {
      scheduled_date: formDate || null,
      date_label: formDateLabel || (formDate ? new Date(formDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
      day_of_week: formDay,
      account: platform === 'linkedin' ? formAccount : null,
      pillar: formPillar,
      format: formFormat,
      hook: platform === 'tiktok' ? formHook : null,
      concept_or_topic: formConcept,
      caption_or_destination: formCaption,
      cta: formCta,
      notes: formNotes || null
    }

    try {
      // 1. Sync to Google Calendar
      if (selectedPost.google_event_id) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'update_marketing_event',
            eventId: selectedPost.google_event_id,
            platform,
            scheduledDate: updatedPost.scheduled_date,
            dateLabel: updatedPost.date_label,
            dayOfWeek: updatedPost.day_of_week,
            account: updatedPost.account,
            pillar: updatedPost.pillar,
            format: updatedPost.format,
            hook: updatedPost.hook,
            conceptOrTopic: updatedPost.concept_or_topic,
            captionOrDestination: updatedPost.caption_or_destination,
            cta: updatedPost.cta,
            notes: updatedPost.notes
          }
        })
      } else {
        const { data: gcalData } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'create_marketing_event',
            platform,
            scheduledDate: updatedPost.scheduled_date,
            dateLabel: updatedPost.date_label,
            dayOfWeek: updatedPost.day_of_week,
            account: updatedPost.account,
            pillar: updatedPost.pillar,
            format: updatedPost.format,
            hook: updatedPost.hook,
            conceptOrTopic: updatedPost.concept_or_topic,
            captionOrDestination: updatedPost.caption_or_destination,
            cta: updatedPost.cta,
            notes: updatedPost.notes
          }
        })
        if (gcalData?.eventId) {
          updatedPost.google_event_id = gcalData.eventId
        }
      }

      // 2. Update DB
      const { error } = await supabase
        .from('marketing_calendar_items')
        .update(updatedPost)
        .eq('id', selectedPost.id)

      if (error) throw error

      // Log activity to Dashboard feed
      await supabase.from('lead_history').insert({
        lead_id: null,
        lead_type: 'marketing',
        event_type: 'marketing',
        content: `✏️ Updated ${platform === 'linkedin' ? 'LinkedIn' : 'TikTok'} post for ${updatedPost.date_label || formDay}`,
        admin_id: user?.id
      })

      setIsEditOpen(false)
      setSelectedPost(null)
      resetForm()
      fetchPosts()
    } catch (err) {
      alert('Error updating post: ' + err.message)
    }
  }

  const handleDelete = async (postId) => {
    if (!isAdmin) return
    if (!confirm('Are you sure you want to delete this content post?')) return

    const postToDelete = posts.find(p => p.id === postId)

    try {
      // 1. Sync to Google Calendar
      if (postToDelete?.google_event_id) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'delete_marketing_event',
            eventId: postToDelete.google_event_id,
            platform: postToDelete.platform
          }
        })
      }

      // 2. Delete from DB
      const { error } = await supabase
        .from('marketing_calendar_items')
        .delete()
        .eq('id', postId)

      if (error) throw error

      // Log activity to Dashboard feed
      await supabase.from('lead_history').insert({
        lead_id: null,
        lead_type: 'marketing',
        event_type: 'marketing',
        content: `🗑️ Deleted ${platform === 'linkedin' ? 'LinkedIn' : 'TikTok'} post scheduled for ${postToDelete?.date_label || 'unknown date'}`,
        admin_id: user?.id
      })

      fetchPosts()
    } catch (err) {
      alert('Error deleting post: ' + err.message)
    }
  }

  const filteredPosts = posts
    .filter(p => p.platform === platform)
    .filter(p => {
      if (pillarFilter !== 'all' && p.pillar !== pillarFilter) return false
      if (!search) return true
      const s = search.toLowerCase()
      return (
        (p.concept_or_topic || '').toLowerCase().includes(s) ||
        (p.caption_or_destination || '').toLowerCase().includes(s) ||
        (p.pillar || '').toLowerCase().includes(s) ||
        (p.format || '').toLowerCase().includes(s)
      )
    })

  // Adaptation notes from Excel
  const adaptationNotes = [
    { area: 'Cadence', linkedin: '3 company posts/week + 2–3 founder posts/week', tiktok: '5 posts/week on a single account', why: "TikTok's algorithm rewards posting frequency more than LinkedIn's; one blended account is simpler." },
    { area: 'Formats', linkedin: 'Long-form text, carousel, screen-recording video', tiktok: 'POV/talking-head, screen recording, before/after split-screen, trending-audio format', why: "TikTok is video-only — carousel content gets repurposed as a fast list-style video." },
    { area: 'Pillar mix', linkedin: '50% Debt / 35% Proof / 15% Offer', tiktok: "Same 50/35/15 ratio, with a 4th 'Trend/Culture' slot layered in once a week", why: "Keeps operational-debt narrative dominant while giving a native trend slot." },
    { area: 'Tone', linkedin: 'Strategic, founder-minded, light on jargon', tiktok: 'Same voice, faster pacing and more direct-to-camera energy', why: "Matches the brandbook's voice — just delivered for a scroll-fast platform." },
    { area: 'CTA', linkedin: 'Soft (link in comments) / Medium (download) / Hard (Comment AUDIT)', tiktok: "Same three CTA tiers, with 'link in bio' replacing 'link in comments'", why: "TikTok's comment-link limitations make bio-link the standard soft-CTA pattern." },
    { area: 'Case studies', linkedin: 'Specificity bar: real/labelled number, named industry, stated timeframe', tiktok: 'Same bar, unchanged', why: 'No reason to relax the proof standard just because the format is shorter.' }
  ]

  // Weeks 5-8 Roadmap from Excel
  const roadmapSteps = [
    { weeks: '5–6', focus: 'Pillar performance review', action: 'Pull impressions, saves/shares and comment quality per pillar across Weeks 1–4', decision: 'Whichever of Pillar 1 (Operational Debt) or Pillar 2 (Proof) is outperforming gets a slightly larger share of Weeks 5–6 posts' },
    { weeks: '5–6', focus: 'Timing lock-in', action: 'Compare the 3 time slots tested in Weeks 1–2', decision: 'Publish going forward at the slot with the best impressions/comments — stop testing, start optimizing' },
    { weeks: '5–6', focus: 'AUDIT automation check', action: 'Confirm every AUDIT comment triggered the automated DM with the booking link end-to-end', decision: 'Any manual chase found = fix before scaling post volume further' },
    { weeks: '7–8', focus: 'Founder vs. company page', action: 'Compare reach and engagement between the two accounts', decision: 'Shift more original posting weight toward whichever account is converting, not just the one with more views' },
    { weeks: '7–8', focus: 'NL vs. EN language split', action: 'Compare which audience is converting to booked audits', decision: 'Decide the split based on booked audits, not impressions — this is the funnel-accountable version of the call' }
  ]

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Platform Switch & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '4px' }}>
          <button
            onClick={() => setPlatform('linkedin')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: platform === 'linkedin' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: platform === 'linkedin' ? '#60a5fa' : '#94A3B8',
              transition: 'all 0.2s'
            }}
          >
            LinkedIn Calendar
          </button>
          <button
            onClick={() => setPlatform('tiktok')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: platform === 'tiktok' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
              color: platform === 'tiktok' ? '#f472b6' : '#94A3B8',
              transition: 'all 0.2s'
            }}
          >
            TikTok Calendar
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: 'white', padding: '10px 16px', fontSize: '0.85rem', outline: 'none', width: '200px'
            }}
          />

          {/* Pillar Filter */}
          <select
            value={pillarFilter}
            onChange={e => setPillarFilter(e.target.value)}
            style={{
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: '#CBD5E1', padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="all">All Pillars</option>
            <option value="Operational Debt">Operational Debt</option>
            <option value="Proof: Cases & Mini-Builds">Proof / Cases</option>
            <option value="Trend / Culture">Trend / Culture</option>
            <option value="Offer & Audit">Offer & Audit</option>
            <option value="Engagement">Engagement</option>
          </select>

          {/* Add Post (Admins only) */}
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setIsAddOpen(true); }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '12px',
                color: 'white', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Post
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#475569', fontSize: '1rem', fontWeight: 600 }}>Loading calendar content...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {filteredPosts.map(post => (
            <div
              key={post.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
                position: 'relative'
              }}
            >
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span style={{
                      background: 'rgba(255,255,255,0.04)', color: '#94A3B8',
                      padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {post.date_label || 'Weekly / Ongoing'}
                    </span>
                    {post.day_of_week && (
                      <span style={{ marginLeft: '6px', color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>
                        {post.day_of_week}
                      </span>
                    )}
                  </div>

                  {/* Account Badge for LinkedIn */}
                  {platform === 'linkedin' && post.account && (
                    <span style={{
                      background: post.account.includes('Company') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: post.account.includes('Company') ? '#93c5fd' : '#34d399',
                      padding: '4px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800
                    }}>
                      {post.account}
                    </span>
                  )}
                </div>

                {/* Pillar and Format badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  <span style={{
                    background: post.pillar === 'Operational Debt' ? 'rgba(239, 68, 68, 0.08)' :
                                post.pillar.includes('Proof') ? 'rgba(59, 130, 246, 0.08)' :
                                post.pillar.includes('Trend') ? 'rgba(244, 114, 182, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    color: post.pillar === 'Operational Debt' ? '#f87171' :
                           post.pillar.includes('Proof') ? '#60a5fa' :
                           post.pillar.includes('Trend') ? '#f472b6' : '#34d399',
                    padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700
                  }}>
                    {post.pillar}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.03)', color: '#CBD5E1', padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600 }}>
                    {post.format}
                  </span>
                </div>

                {/* Hook (TikTok only) */}
                {platform === 'tiktok' && post.hook && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderLeft: '3px solid #f472b6', padding: '10px 12px', borderRadius: '0 8px 8px 0', marginBottom: '14px' }}>
                    <p style={{ margin: 0, color: '#f472b6', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Hook (First 2 sec)</p>
                    <p style={{ margin: 0, color: '#E2E8F0', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.4 }}>{post.hook}</p>
                  </div>
                )}

                {/* Topic / Concept */}
                <p style={{ margin: '0 0 14px 0', color: 'white', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5 }}>
                  {post.concept_or_topic}
                </p>

                {/* On-screen text / destination */}
                {post.caption_or_destination && (
                  <div style={{ margin: '0 0 14px 0', color: '#94A3B8', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {platform === 'tiktok' ? 'Caption / On-screen Text' : 'Destination'}
                    </span>
                    <span style={{ color: '#CBD5E1', lineHeight: 1.4 }}>{post.caption_or_destination}</span>
                  </div>
                )}

                {/* CTA */}
                {post.cta && post.cta !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 16px 0' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CTA:</span>
                    <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700 }}>{post.cta}</span>
                  </div>
                )}
              </div>

              {/* Footer info & notes */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '14px', marginTop: '8px' }}>
                {post.notes && (
                  <p style={{ margin: '0 0 12px 0', color: '#64748B', fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                    💡 {post.notes}
                  </p>
                )}

                {/* Edit & Delete Action Panel (Admins only) */}
                {isAdmin && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => handleOpenEdit(post)}
                      style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', color: '#CBD5E1', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px', color: '#ef4444', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>No posts match your filters or search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Guides Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginTop: '40px' }}>
        {/* TikTok Guides */}
        {platform === 'tiktok' && (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
            <h4 style={{ margin: '0 0 16px', color: '#f472b6', fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>TikTok Strategy Adaptations</h4>
            <p style={{ margin: '0 0 20px', color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.6' }}>How this differs from the primary LinkedIn content plan:</p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {adaptationNotes.map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px' }}>
                  <p style={{ margin: '0 0 6px', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{item.area}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                    <div><span style={{ color: '#64748B', fontWeight: 600 }}>LinkedIn:</span> {item.linkedin}</div>
                    <div><span style={{ color: '#f472b6', fontWeight: 600 }}>TikTok:</span> {item.tiktok}</div>
                  </div>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem', fontStyle: 'italic' }}>Why: {item.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LinkedIn Roadmap */}
        {platform === 'linkedin' && (
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
            <h4 style={{ margin: '0 0 16px', color: '#60a5fa', fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Weeks 5–8 Review Roadmap</h4>
            <p style={{ margin: '0 0 20px', color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.6' }}>Strategic milestones to iterate and scale post volume:</p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {roadmapSteps.map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '14px', display: 'flex', gap: '14px' }}>
                  <span style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, height: 'fit-content' }}>
                    W{item.weeks}
                  </span>
                  <div>
                    <p style={{ margin: '0 0 4px', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{item.focus}</p>
                    <p style={{ margin: '0 0 6px', color: '#94A3B8', fontSize: '0.78rem', lineHeight: 1.4 }}><span style={{ color: '#64748B', fontWeight: 600 }}>Action:</span> {item.action}</p>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem', fontStyle: 'italic' }}><span style={{ fontWeight: 600 }}>Decision Rule:</span> {item.decision}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modals */}
      {(isAddOpen || isEditOpen) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#0F1115', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
            padding: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', fontWeight: 800, color: 'white', fontFamily: "'Space Grotesk', sans-serif" }}>
              {isAddOpen ? `Add New ${platform === 'linkedin' ? 'LinkedIn' : 'TikTok'} Post` : 'Edit Content Post'}
            </h3>

            <form onSubmit={isAddOpen ? handleCreate : handleUpdate} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Scheduled Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Date Label (e.g. Jul 27, 2026 or Wk1 — daily)</label>
                  <input
                    type="text"
                    value={formDateLabel}
                    placeholder="e.g. Jul 27, 2026"
                    onChange={e => setFormDateLabel(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Day of Week</label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Mon–Sun">Mon–Sun</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Content Pillar</label>
                  <select
                    value={formPillar}
                    onChange={e => setFormPillar(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="Operational Debt">Operational Debt</option>
                    <option value="Proof: Cases & Mini-Builds">Proof: Cases & Mini-Builds</option>
                    <option value="Trend / Culture">Trend / Culture</option>
                    <option value="Offer & Audit">Offer & Audit</option>
                    <option value="Engagement">Engagement</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Format</label>
                  <input
                    type="text"
                    value={formFormat}
                    placeholder="e.g. Talking head, Carousel, Skit"
                    onChange={e => setFormFormat(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
                {platform === 'linkedin' ? (
                  <div>
                    <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Posting Account</label>
                    <select
                      value={formAccount}
                      onChange={e => setFormAccount(e.target.value)}
                      style={{
                        width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                      }}
                    >
                      <option value="Company Page">Company Page</option>
                      <option value="Founder Profile">Founder Profile</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Hook (First 2 sec)</label>
                    <input
                      type="text"
                      value={formHook}
                      placeholder="Hook text..."
                      onChange={e => setFormHook(e.target.value)}
                      style={{
                        width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Topic / Concept</label>
                <textarea
                  rows="3"
                  value={formConcept}
                  required
                  placeholder="Main message, skits, or video description..."
                  onChange={e => setFormConcept(e.target.value)}
                  style={{
                    width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: 'white', padding: '12px', fontSize: '0.85rem', outline: 'none', resize: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>
                  {platform === 'linkedin' ? 'Destination Link / Type' : 'Caption / On-screen Text'}
                </label>
                <input
                  type="text"
                  value={formCaption}
                  placeholder={platform === 'linkedin' ? 'e.g. Landing page: Checklist download' : 'e.g. The 5-tool tax nobody talks about'}
                  onChange={e => setFormCaption(e.target.value)}
                  style={{
                    width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>CTA</label>
                  <input
                    type="text"
                    value={formCta}
                    placeholder="e.g. Comment AUDIT, Follow for more"
                    onChange={e => setFormCta(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>Notes</label>
                  <input
                    type="text"
                    value={formNotes}
                    placeholder="Any review decisions or warnings..."
                    onChange={e => setFormNotes(e.target.value)}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'white', padding: '10px 14px', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: 'white', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none',
                    borderRadius: '12px', color: 'white', padding: '10px 24px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {isAddOpen ? 'Create Post' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
