import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'


const CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')     ?? ''
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''
const REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') ?? ''
const ADMIN_EMAIL   = 'info@autoflowstudio.net'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Replace {{variable}} placeholders in subject/body templates
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

// Convert newlines to HTML blocks/breaks if plain text is input
function formatBodyToHtml(bodyText: string): string {
  const hasHtml = /<[a-z][\s\S]*>/i.test(bodyText)
  if (hasHtml) {
    return bodyText
  }
  return bodyText
    .split(/\n\s*\n/)
    .map(para => `<p style="margin: 0 0 16px 0;">${para.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

// ── CRITICAL: Google OAuth token endpoint requires form-encoded body, NOT JSON ──
async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      `Missing OAuth secrets — CLIENT_ID:${!!CLIENT_ID} CLIENT_SECRET:${!!CLIENT_SECRET} REFRESH_TOKEN:${!!REFRESH_TOKEN}. ` +
      `Set them via: supabase secrets set GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=...`
    )
  }

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type:    'refresh_token',
  })

  console.log('[OAuth] Requesting access token...')
  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  })
  const data = await res.json()

  if (!res.ok) {
    console.error('[OAuth] Token error:', JSON.stringify(data))
    throw new Error(`OAuth failed (${res.status}): ${data.error} — ${data.error_description}`)
  }

  console.log('[OAuth] Token obtained successfully')
  return data.access_token
}


// RFC 2047 encode the subject so emojis and non-ASCII chars survive MIME headers
function encodeSubject(subject: string): string {
  // Encode as UTF-8 base64 per RFC 2047: =?UTF-8?B?<base64>?=
  // Split into chunks of max 75 chars (encoded) to stay within line length limits
  const encoded = btoa(unescape(encodeURIComponent(subject)))
  // Wrap in RFC 2047 format — single chunk is fine for typical subjects
  return `=?UTF-8?B?${encoded}?=`
}

function createRawMessage(to: string, subject: string, html: string) {
  const str = [
    `From: "AutoFlow Studio" <${ADMIN_EMAIL}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${encodeSubject(subject)}`,
    '',
    html
  ].join('\r\n')

  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function getOrCreateFollowUpsCalendar(accessToken: string): Promise<string> {
  const listRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  if (!listRes.ok) {
    const errText = await listRes.text()
    throw new Error(`Failed to list calendars: ${listRes.status} — ${errText}`)
  }
  
  const listData = await listRes.json()
  const calendars = listData.items || []
  
  const existing = calendars.find((cal: any) => cal.summary === 'AutoFlow Follow-Ups')
  if (existing) {
    return existing.id
  }
  
  console.log('[Calendar] Creating secondary calendar "AutoFlow Follow-Ups"...')
  const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: 'AutoFlow Follow-Ups',
      description: 'Internal salesperson follow-up reminders scheduled via CRM.'
    })
  })
  
  if (!createRes.ok) {
    const errText = await createRes.text()
    throw new Error(`Failed to create calendar: ${createRes.status} — ${errText}`)
  }
  
  const createData = await createRes.json()
  return createData.id
}

async function getOrCreateTikTokCalendar(accessToken: string): Promise<string> {
  const listRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  if (!listRes.ok) {
    const errText = await listRes.text()
    throw new Error(`Failed to list calendars: ${listRes.status} — ${errText}`)
  }
  
  const listData = await listRes.json()
  const calendars = listData.items || []
  
  const existing = calendars.find((cal: any) => cal.summary === 'AutoFlow TikTok Calendar')
  if (existing) {
    return existing.id
  }
  
  console.log('[Calendar] Creating secondary calendar "AutoFlow TikTok Calendar"...')
  const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: 'AutoFlow TikTok Calendar',
      description: 'TikTok content postings scheduled via CRM.'
    })
  })
  
  if (!createRes.ok) {
    const errText = await createRes.text()
    throw new Error(`Failed to create TikTok calendar: ${createRes.status} — ${errText}`)
  }
  
  const createData = await createRes.json()
  return createData.id
}

async function getOrCreateLinkedInCalendar(accessToken: string): Promise<string> {
  const listRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  if (!listRes.ok) {
    const errText = await listRes.text()
    throw new Error(`Failed to list calendars: ${listRes.status} — ${errText}`)
  }
  
  const listData = await listRes.json()
  const calendars = listData.items || []
  
  const existing = calendars.find((cal: any) => cal.summary === 'AutoFlow LinkedIn Calendar')
  if (existing) {
    return existing.id
  }
  
  console.log('[Calendar] Creating secondary calendar "AutoFlow LinkedIn Calendar"...')
  const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: 'AutoFlow LinkedIn Calendar',
      description: 'LinkedIn content postings scheduled via CRM.'
    })
  })
  
  if (!createRes.ok) {
    const errText = await createRes.text()
    throw new Error(`Failed to create LinkedIn calendar: ${createRes.status} — ${errText}`)
  }
  
  const createData = await createRes.json()
  return createData.id
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  const urlObj = new URL(req.url)
  
  // ── GET Request: Open Tracking Pixel ──────────────────────────────────────
  if (req.method === 'GET' && urlObj.searchParams.has('track_id')) {
    const trackId = urlObj.searchParams.get('track_id')
    if (trackId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        const { error } = await supabase
          .from('outreach_emails')
          .update({ status: 'Opened', opened_at: new Date().toISOString() })
          .eq('id', trackId)
          .eq('status', 'Sent')
        if (error) {
          console.error('[track-open] DB error:', error)
        } else {
          console.log(`[track-open] Marked ${trackId} as Opened`)
        }
      } catch (err) {
        console.error('[track-open] Error updating open:', err)
      }
    }

    const pixel = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ])
    return new Response(pixel, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache'
      }
    })
  }

  try {
    const body = await req.json()
    const { type, name, email, company, message, service, size, platform, recipient, subject: customSubject, emailLogId } = body
    console.log(`[send-email] type=${type} recipient=${recipient || email}`)

    // ── aircall_dial (Aircall Outbound Call API) ───────────────────────────
    if (type === 'aircall_dial') {
      const { phone } = body
      if (!phone) throw new Error('Missing required aircall_dial field: phone')
      const b64 = btoa('f5faee77fd7497d482376fae85cf85cf:10e3d5746a9e19b1ad96a56463c73842')
      const dialRes = await fetch('https://api.aircall.io/v1/users/2055112/calls', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${b64}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: phone,
          number_id: 1369705
        })
      })
      console.log(`[aircall_dial] Triggered call to ${phone}, HTTP status: ${dialRes.status}`)
      return new Response(JSON.stringify({ success: true, status: dialRes.status }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── get_busy_times (Google Calendar API) ───────────────────────────────
    if (type === 'get_busy_times') {
      const { timeMin, timeMax } = body
      if (!timeMin || !timeMax) {
        throw new Error('Missing required get_busy_times fields: timeMin, timeMax')
      }
      const accessToken = await getAccessToken()
      console.log(`[get_busy_times] Fetching events from ${timeMin} to ${timeMax}`)

      // Fetch primary calendar details to get timezone
      const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const calData = await calRes.json()
      const timeZone = calData.timeZone || 'UTC'
      console.log(`[get_busy_times] Calendar timezone is: ${timeZone}`)

      // Fetch events
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${JSON.stringify(data)}`)
      }

      const busySlots = (data.items || []).map((event: any) => ({
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        summary: event.summary || 'Busy'
      }))

      return new Response(JSON.stringify({ success: true, busy: busySlots, timeZone }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── 0. Schedule Call (Google Calendar API) ───────────────────────────────
    if (type === 'schedule_call') {
      const { leadEmail, leadName, startTime, endTime, title, description, colorId, agentName } = body
      if (!leadEmail || !startTime || !endTime) {
        throw new Error('Missing required schedule_call fields: leadEmail, startTime, endTime')
      }

      const accessToken = await getAccessToken()
      console.log(`[schedule_call] Scheduling meeting "${title}" for ${leadEmail} at ${startTime}`)

      const eventBody = {
        summary: title || `Meeting with ${leadName || 'Client'}`,
        description: description || 'Scheduled via CRM',
        start: {
          dateTime: startTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC'
        },
        attendees: [
          { email: leadEmail }
        ],
        colorId: colorId || '1',
        conferenceData: {
          createRequest: {
            requestId: `autoflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      })

      const responseData = await res.text()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${responseData}`)
      }

      console.log('[schedule_call] Event created OK')
      const event = JSON.parse(responseData)
      const hangoutLink = event.hangoutLink || 'No Meet link generated'

      // Send confirmation email to Admin (info@autoflowstudio.net)
      try {
        const formattedTime = new Date(startTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })

        const adminSubject = `[Booking Confirmed] ${eventBody.summary}`
        const adminHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, Helvetica, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 30px; margin: 0; }
              .card { background-color: #111827; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; max-width: 550px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
              h2 { margin-top: 0; color: #60a5fa; font-size: 1.4rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; font-weight: 800; letter-spacing: -0.01em; }
              .detail { margin: 18px 0; }
              .label { color: #6b7280; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
              .value { color: #f3f4f6; font-weight: 600; font-size: 0.95rem; }
              .btn { display: inline-block; width: 100%; box-sizing: border-box; padding: 14px; background: linear-gradient(135deg, #3b82f6, #10b981); color: white !important; text-decoration: none; border-radius: 10px; font-weight: 800; margin-top: 24px; font-size: 0.9rem; text-align: center; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Call Scheduled Successfully</h2>
              
              <div class="detail">
                <span class="label">Booked By (Agent)</span>
                <span class="value">${agentName || 'CRM Admin'}</span>
              </div>
              
              <div class="detail">
                <span class="label">Meeting Title</span>
                <span class="value">${eventBody.summary}</span>
              </div>
              
              <div class="detail">
                <span class="label">With Client</span>
                <span class="value">${leadName} (${leadEmail})</span>
              </div>
              
              <div class="detail">
                <span class="label">When</span>
                <span class="value">${formattedTime}</span>
              </div>
              
              <div class="detail">
                <span class="label">Notes / Description</span>
                <span class="value">${eventBody.description}</span>
              </div>

              <div style="text-align: center;">
                <a href="${hangoutLink}" class="btn" target="_blank">Join Google Meet</a>
              </div>
            </div>
          </body>
          </html>
        `

        console.log('[schedule_call] Sending admin notification to:', ADMIN_EMAIL)
        const adminRaw = createRawMessage(ADMIN_EMAIL, adminSubject, adminHtml)
        const emailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: adminRaw })
        })
        if (!emailRes.ok) {
          const errData = await emailRes.text()
          console.error('[schedule_call] Failed to send admin booking email:', errData)
        } else {
          console.log('[schedule_call] Admin booking email sent OK')
        }
      } catch (err) {
        console.error('[schedule_call] Error sending admin notification:', err.message)
      }

      return new Response(JSON.stringify({ success: true, event }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Get Follow Ups Calendar ID (Google Calendar API) ────────────────────
    if (type === 'get_followups_calendar_id') {
      const accessToken = await getAccessToken()
      const calendarId = await getOrCreateFollowUpsCalendar(accessToken)
      return new Response(JSON.stringify({ success: true, calendarId }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Get Marketing Calendars (Google Calendar API) ───────────────────────
    if (type === 'get_marketing_calendars') {
      const accessToken = await getAccessToken()
      const tikTokCalendarId = await getOrCreateTikTokCalendar(accessToken)
      const linkedInCalendarId = await getOrCreateLinkedInCalendar(accessToken)
      return new Response(JSON.stringify({ success: true, tikTokCalendarId, linkedInCalendarId }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Create Marketing Event (Google Calendar API) ────────────────────────
    if (type === 'create_marketing_event') {
      const { platform, scheduledDate, dateLabel, dayOfWeek, account, pillar, format, hook, conceptOrTopic, captionOrDestination, cta, notes, startTime, endTime, timeZone, recurrenceRule } = body
      const accessToken = await getAccessToken()
      const calendarId = platform === 'tiktok'
        ? await getOrCreateTikTokCalendar(accessToken)
        : await getOrCreateLinkedInCalendar(accessToken)
      
      const summary = `[${(platform || '').toUpperCase()}] ${conceptOrTopic ? conceptOrTopic.substring(0, 60) : 'Content Post'}`
      
      const descriptionLines = [
        `Platform: ${platform || ''}`,
        `Pillar: ${pillar || ''}`,
        `Format: ${format || ''}`,
        account ? `Account: ${account}` : '',
        hook ? `Hook: "${hook}"` : '',
        captionOrDestination ? `Caption/Dest: ${captionOrDestination}` : '',
        cta ? `CTA: ${cta}` : '',
        notes ? `Notes: ${notes}` : '',
        `Date Label: ${dateLabel || ''}`,
        `Day: ${dayOfWeek || ''}`
      ].filter(Boolean)

      const eventBody: Record<string, any> = {
        summary,
        description: descriptionLines.join('\n')
      }

      if (startTime && endTime) {
        eventBody.start = { dateTime: startTime, timeZone: timeZone || 'UTC' }
        eventBody.end = { dateTime: endTime, timeZone: timeZone || 'UTC' }
        if (recurrenceRule) {
          eventBody.recurrence = [recurrenceRule]
        }
      } else if (scheduledDate) {
        eventBody.start = { date: scheduledDate }
        const endDate = new Date(scheduledDate)
        endDate.setDate(endDate.getDate() + 1)
        eventBody.end = { date: endDate.toISOString().split('T')[0] }
      } else {
        const todayStr = new Date().toISOString().split('T')[0]
        eventBody.start = { date: todayStr }
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        eventBody.end = { date: tomorrow.toISOString().split('T')[0] }
        eventBody.summary = `[Weekly/Ongoing] ` + eventBody.summary
      }

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      })

      const resData = await res.json()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${JSON.stringify(resData)}`)
      }

      return new Response(JSON.stringify({ success: true, eventId: resData.id }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Update Marketing Event (Google Calendar API) ────────────────────────
    if (type === 'update_marketing_event') {
      const { eventId, platform, scheduledDate, dateLabel, dayOfWeek, account, pillar, format, hook, conceptOrTopic, captionOrDestination, cta, notes, startTime, endTime, timeZone, recurrenceRule } = body
      if (!eventId) throw new Error('Missing eventId for update_marketing_event')

      const accessToken = await getAccessToken()
      const calendarId = platform === 'tiktok'
        ? await getOrCreateTikTokCalendar(accessToken)
        : await getOrCreateLinkedInCalendar(accessToken)
      
      const summary = `[${(platform || '').toUpperCase()}] ${conceptOrTopic ? conceptOrTopic.substring(0, 60) : 'Content Post'}`
      
      const descriptionLines = [
        `Platform: ${platform || ''}`,
        `Pillar: ${pillar || ''}`,
        `Format: ${format || ''}`,
        account ? `Account: ${account}` : '',
        hook ? `Hook: "${hook}"` : '',
        captionOrDestination ? `Caption/Dest: ${captionOrDestination}` : '',
        cta ? `CTA: ${cta}` : '',
        notes ? `Notes: ${notes}` : '',
        `Date Label: ${dateLabel || ''}`,
        `Day: ${dayOfWeek || ''}`
      ].filter(Boolean)

      const eventBody: Record<string, any> = {
        summary,
        description: descriptionLines.join('\n')
      }

      if (startTime && endTime) {
        eventBody.start = { dateTime: startTime, timeZone: timeZone || 'UTC' }
        eventBody.end = { dateTime: endTime, timeZone: timeZone || 'UTC' }
        if (recurrenceRule) {
          eventBody.recurrence = [recurrenceRule]
        }
      } else if (scheduledDate) {
        eventBody.start = { date: scheduledDate }
        const endDate = new Date(scheduledDate)
        endDate.setDate(endDate.getDate() + 1)
        eventBody.end = { date: endDate.toISOString().split('T')[0] }
      } else {
        const todayStr = new Date().toISOString().split('T')[0]
        eventBody.start = { date: todayStr }
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        eventBody.end = { date: tomorrow.toISOString().split('T')[0] }
        eventBody.summary = `[Weekly/Ongoing] ` + eventBody.summary
      }

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      })

      const resData = await res.json()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${JSON.stringify(resData)}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Delete Marketing Event (Google Calendar API) ────────────────────────
    if (type === 'delete_marketing_event') {
      const { eventId, platform } = body
      if (!eventId) throw new Error('Missing eventId for delete_marketing_event')
      if (!platform) throw new Error('Missing platform for delete_marketing_event')

      const accessToken = await getAccessToken()
      const calendarId = platform === 'tiktok'
        ? await getOrCreateTikTokCalendar(accessToken)
        : await getOrCreateLinkedInCalendar(accessToken)
      
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!res.ok && res.status !== 404) {
        const errText = await res.text()
        throw new Error(`Google Calendar API error ${res.status}: ${errText}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Create Follow Up (Google Calendar API) ───────────────────────────────
    if (type === 'create_followup') {
      const { leadName, leadEmail, leadType, notesContent, scheduledAt, salespersonName, salespersonEmail, colorId } = body
      if (!scheduledAt || !leadName) {
        throw new Error('Missing required fields for create_followup: scheduledAt, leadName')
      }

      const accessToken = await getAccessToken()
      const calendarId = await getOrCreateFollowUpsCalendar(accessToken)
      console.log(`[create_followup] Creating event for ${leadName} on calendar ${calendarId} at ${scheduledAt}`)

      const start = new Date(scheduledAt)
      const end = new Date(start.getTime() + 15 * 60 * 1000) // 15 mins default

      const eventBody = {
        summary: `📞 Follow-up: ${leadName} (${salespersonName || 'Agent'})`,
        description: `Follow-up scheduled via CRM.\n\nLead Details:\n- Name: ${leadName}\n- Email: ${leadEmail || 'N/A'}\n- Type: ${leadType || 'N/A'}\n\nSalesperson: ${salespersonName || 'N/A'} (${salespersonEmail || 'N/A'})\n\nNotes:\n"${notesContent || 'Follow up'}"\n\n----\n[CRM_LEAD_ID: ${body.leadId || ''}]\n[CRM_LEAD_TYPE: ${leadType || ''}]`,
        start: {
          dateTime: start.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'UTC'
        },
        attendees: salespersonEmail ? [{ email: salespersonEmail }] : [],
        colorId: colorId || '1',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 30 },
            { method: 'popup', minutes: 10 }
          ]
        }
      }

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      })

      const responseData = await res.text()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${responseData}`)
      }

      const event = JSON.parse(responseData)
      return new Response(JSON.stringify({ success: true, eventId: event.id }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Update Follow Up (Google Calendar API) ───────────────────────────────
    if (type === 'update_followup') {
      const { eventId, scheduledAt, notesContent, leadName, leadEmail, leadType, salespersonName, salespersonEmail, colorId } = body
      if (!eventId || !scheduledAt) {
        throw new Error('Missing required fields for update_followup: eventId, scheduledAt')
      }

      const accessToken = await getAccessToken()
      const calendarId = await getOrCreateFollowUpsCalendar(accessToken)
      console.log(`[update_followup] Updating event ${eventId} on calendar ${calendarId} for new scheduled time ${scheduledAt}`)

      const start = new Date(scheduledAt)
      const end = new Date(start.getTime() + 15 * 60 * 1000)

      let patchBody: any = {
        start: {
          dateTime: start.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'UTC'
        }
      }

      if (notesContent || leadName) {
        patchBody.summary = `📞 Follow-up: ${leadName || 'Client'} (${salespersonName || 'Agent'})`
        patchBody.description = `Follow-up scheduled via CRM.\n\nLead Details:\n- Name: ${leadName || 'N/A'}\n- Email: ${leadEmail || 'N/A'}\n- Type: ${leadType || 'N/A'}\n\nSalesperson: ${salespersonName || 'N/A'} (${salespersonEmail || 'N/A'})\n\nNotes:\n"${notesContent || 'Follow up'}"\n\n----\n[CRM_LEAD_ID: ${body.leadId || ''}]\n[CRM_LEAD_TYPE: ${leadType || ''}]`
      }
      
      if (colorId) {
        patchBody.colorId = colorId
      }

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?sendUpdates=all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchBody)
      })

      const responseData = await res.text()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${responseData}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Delete Follow Up (Google Calendar API) ───────────────────────────────
    if (type === 'delete_followup') {
      const { eventId } = body
      if (!eventId) {
        throw new Error('Missing required fields for delete_followup: eventId')
      }

      const accessToken = await getAccessToken()
      const calendarId = await getOrCreateFollowUpsCalendar(accessToken)
      console.log(`[delete_followup] Deleting event ${eventId} on calendar ${calendarId}`)

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!res.ok && res.status !== 404) {
        const responseData = await res.text()
        throw new Error(`Google Calendar API error ${res.status}: ${responseData}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── Sync Calendar (Google Calendar API) ──────────────────────────────────
    if (type === 'sync_calendar') {
      const accessToken = await getAccessToken()
      const calendarId = await getOrCreateFollowUpsCalendar(accessToken)
      
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=250&singleEvents=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      const responseData = await res.text()
      if (!res.ok) {
        throw new Error(`Google Calendar API error ${res.status}: ${responseData}`)
      }
      
      const data = JSON.parse(responseData)
      return new Response(JSON.stringify({ success: true, events: data.items || [] }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── 1. Campaigns ────────────────────────────────────────────────────────
    if (type === 'campaign') {
      const accessToken = await getAccessToken()
      console.log('[campaign] Sending to:', recipient)
      let finalMessage = message
      if (emailLogId) {
        const trackingUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email?track_id=${emailLogId}`
        finalMessage += `<img src="${trackingUrl}" width="1" height="1" style="display:none !important;" alt="" />`
      }
      const raw = createRawMessage(recipient, customSubject || 'Update from AutoFlow Studio', finalMessage)
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      })
      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Gmail Campaign error ${res.status}: ${errBody}`)
      }
      console.log('[campaign] Sent OK')
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    // ── 1.1 Sync Replies (Gmail Inbox Polling) ─────────────────────────────────
    if (type === 'sync_replies') {
      const accessToken = await getAccessToken()
      console.log('[sync_replies] Starting Gmail Sync')
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Fetch primary category list of messages
      const gmailUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=label:INBOX'
      const listRes = await fetch(gmailUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (!listRes.ok) {
        throw new Error(`Gmail list failed: ${await listRes.text()}`)
      }
      const listData = await listRes.json()
      const messages = listData.messages || []
      console.log(`[sync_replies] Scanning ${messages.length} recent messages`)

      let syncedCount = 0

      for (const msgSummary of messages) {
        const msgId = msgSummary.id
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        if (!msgRes.ok) continue
        const msg = await msgRes.json()

        const headers = msg.payload?.headers || []
        const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || ''
        const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || ''
        const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || ''

        const emailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/)
        const senderEmail = emailMatch ? emailMatch[1].trim().toLowerCase() : ''
        if (!senderEmail) continue

        // Skip outbound or system messages
        if (senderEmail === 'info@autoflowstudio.net' || senderEmail.includes('autoflowstudio')) continue

        // Search leads
        const { data: outreachLead } = await supabase.from('outreach_leads').select('id, name').eq('email', senderEmail).maybeSingle()
        let matchedLead = outreachLead ? { ...outreachLead, type: 'outreach' } : null

        if (!matchedLead) {
          const { data: bookingLead } = await supabase.from('booking_leads').select('id, name').eq('email', senderEmail).maybeSingle()
          matchedLead = bookingLead ? { ...bookingLead, type: 'booking' } : null
        }

        if (!matchedLead) {
          const { data: contactLead } = await supabase.from('contact_leads').select('id, name').eq('email', senderEmail).maybeSingle()
          matchedLead = contactLead ? { ...contactLead, type: 'contact' } : null
        }

        if (!matchedLead) continue // No match found in CRM

        // Prevent duplicate logs
        const syncTag = `[Gmail Sync ID: ${msgId}]`
        const { data: existingHist } = await supabase
          .from('lead_history')
          .select('id')
          .eq('lead_id', matchedLead.id)
          .ilike('content', `%${syncTag}%`)
          .maybeSingle()

        if (existingHist) continue // Already synced

        // Log reply
        const snippet = msg.snippet || ''
        const contentLog = `${syncTag}\nSubject: ${subjectHeader}\nDate: ${dateHeader}\n\n${snippet}`
        await supabase.from('lead_history').insert([{
          lead_id: matchedLead.id,
          lead_type: matchedLead.type,
          event_type: 'note',
          content: contentLog
        }])

        // Update lead status to In Progress
        const targetTable = matchedLead.type === 'booking' ? 'booking_leads' : (matchedLead.type === 'contact' ? 'contact_leads' : 'outreach_leads')
        await supabase
          .from(targetTable)
          .update({ status: 'In Progress' })
          .eq('id', matchedLead.id)

        // Mark associated outreach email as Replied
        const { data: latestEmail } = await supabase
          .from('outreach_emails')
          .select('id')
          .eq('lead_id', matchedLead.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (latestEmail) {
          await supabase
            .from('outreach_emails')
            .update({ status: 'Replied' })
            .eq('id', latestEmail.id)
        }

        syncedCount++
      }

      console.log(`[sync_replies] Successfully synced ${syncedCount} replies`)
      return new Response(JSON.stringify({ success: true, synced: syncedCount }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── 2. Status-Change Notifications ──────────────────────────────────────
    if (type === 'status_change') {
      const { recipient: to, name: leadName, status, subject: tmplSubject, body: tmplBody, company, service } = body
      if (!to || !tmplSubject || !tmplBody) throw new Error('Missing required status_change fields: recipient, subject, body')

      const vars: Record<string, string> = {
        name:    leadName  || 'there',
        status:  status    || '',
        company: company   || '',
        service: service   || '',
      }

      const finalSubject = interpolate(tmplSubject, vars)
      const finalBodyInner = interpolate(tmplBody, vars)

      const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.5; color: #1a1a1a; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0; padding: 10px 0;">
    ${formatBodyToHtml(finalBodyInner)}
  </div>
</body>
</html>`

      const accessToken = await getAccessToken()
      console.log('[status_change] Sending to:', to, 'subject:', finalSubject)
      const raw = createRawMessage(to, finalSubject, wrappedHtml)
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(`Status-change email failed: ${JSON.stringify(err)}`)
      }
      console.log('[status_change] Sent OK')
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    // ── 2b. Chatbot Takeover Notifications ─────────────────────────────────────
    if (type === 'chatbot_notification') {
      const { recipient: to, subject: finalSubject, html: wrappedHtml } = body
      if (!to || !finalSubject || !wrappedHtml) throw new Error('Missing required chatbot_notification fields: recipient, subject, html')

      const accessToken = await getAccessToken()
      console.log('[chatbot_notification] Sending to:', to, 'subject:', finalSubject)
      const raw = createRawMessage(to, finalSubject, wrappedHtml)
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(`Chatbot notification email failed: ${JSON.stringify(err)}`)
      }
      console.log('[chatbot_notification] Sent OK')
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...CORS } })
    }

    // ── 3. Lead form submissions (booking / contact) ─────────────────────────
    if (!email || !name) {
      throw new Error(`Missing required lead info: name=${name}, email=${email}`);
    }

    const accessToken = await getAccessToken()


    const adminSubject = "New Lead"
    const adminHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; background: #f9fafb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">New Lead Captured</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service || 'N/A'}</p>
        <p><strong>Business Size:</strong> ${size || 'N/A'}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">${message || 'N/A'}</div>
      </div>
    `

    const customerSubject = "AutoFlow Studio - We've received your request!"
    const customerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header with brand gradient & logo symbol -->
          <tr>
            <td style="background: linear-gradient(135deg, #7949da, #5646e4); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #ffffff; font-size: 20px; font-weight: 800; font-family: Arial, Helvetica, sans-serif; letter-spacing: -0.02em;">
                    ⚡ AutoFlow Studio
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content Body -->
          <tr>
            <td style="padding: 40px 32px; background-color: #ffffff;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; font-weight: 700; font-family: Arial, Helvetica, sans-serif;">Hello ${name},</h2>
              
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Thank you for reaching out to us. We've successfully received your <strong>${type === 'booking' ? 'audit request' : 'message'}</strong>.
              </p>
              
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Our team of automation specialists is currently analyzing your requirements. We aim to provide a detailed response within <strong>24 hours</strong>.
              </p>
              
              <!-- Blockquote Callout -->
              <div style="margin: 24px 0; padding: 16px 20px; background: rgba(121, 73, 218, 0.05); border-left: 4px solid #7949da; border-radius: 8px;">
                <p style="color: #5646e4; margin: 0; font-style: italic; font-weight: 600; font-size: 14.5px;">
                  "Automating the present to secure your future."
                </p>
              </div>
              
              <!-- Call to Action Buttons -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; width: 100%;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #7949da, #5646e4); overflow: hidden;">
                    <a href="https://autoflowstudio.net/portfolio" target="_blank" style="padding: 14px 28px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block; width: 100%; box-sizing: border-box; text-align: center;">View Our Recent Projects</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px; text-align: center;">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0; font-weight: 500;">
                      Have other questions or want to jump straight into a face-to-face strategy session?
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 12px; border: 1px solid #7949da;">
                          <a href="https://neeto.com/call/autoflow" target="_blank" style="padding: 10px 20px; font-size: 14px; font-weight: 700; color: #7949da; text-decoration: none; display: inline-block;">Book a Strategy Call</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0; font-weight: 500;">
                &copy; 2026 AutoFlow Studio. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">
                You received this email because you contacted us through autoflowstudio.net
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    // Send to Admin
    console.log('[lead] Sending admin notification to:', ADMIN_EMAIL)
    const adminRaw = createRawMessage(ADMIN_EMAIL, adminSubject, adminHtml)
    const adminRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: adminRaw }),
    })
    if (!adminRes.ok) {
      const err = await adminRes.json()
      throw new Error(`Admin email failed: ${JSON.stringify(err)}`)
    }
    console.log('[lead] Admin email sent OK')

    // Send to Customer
    console.log('[lead] Sending customer confirmation to:', email)
    const customerRaw = createRawMessage(email, customerSubject, customerHtml)
    const customerRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: customerRaw }),
    })
    if (!customerRes.ok) {
      const err = await customerRes.json()
      throw new Error(`Customer email failed: ${JSON.stringify(err)}`)
    }
    console.log('[lead] Customer email sent OK')

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    })
  } catch (err) {
    console.error('[send-email] ERROR:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    })
  }
})
