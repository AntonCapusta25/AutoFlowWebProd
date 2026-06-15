// Supabase Edge Function — sends emails via Gmail API
// Deploy: supabase functions deploy send-email
// Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN

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


function createRawMessage(to: string, subject: string, html: string) {
  const str = [
    `From: "AutoFlow Studio" <${ADMIN_EMAIL}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    html
  ].join('\r\n')

  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body = await req.json()
    const { type, name, email, company, message, service, size, platform, recipient, subject: customSubject } = body
    console.log(`[send-email] type=${type} recipient=${recipient || email}`)

    // ── 0. Schedule Call (Google Calendar API) ───────────────────────────────
    if (type === 'schedule_call') {
      const { leadEmail, leadName, startTime, endTime, title, description, colorId } = body
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
        colorId: colorId || '1'
      }

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
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
      return new Response(JSON.stringify({ success: true, event: JSON.parse(responseData) }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // ── 1. Campaigns ────────────────────────────────────────────────────────
    if (type === 'campaign') {
      const accessToken = await getAccessToken()
      console.log('[campaign] Sending to:', recipient)
      const raw = createRawMessage(recipient, customSubject || 'Update from AutoFlow Studio', message)
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
  <style>
    /* Force text elements to inherit white/grey color and styles in dark theme */
    p, span, td, div, h1, h2, h3, h4, li {
      color: #f8fafc !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    a {
      color: #ec4899 !important;
      text-decoration: underline;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#ec4899,#8b5cf6);padding:40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.025em;">AutoFlow Studio</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;background:#1e293b;color:#f8fafc;font-size:16px;line-height:1.6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            ${finalBodyInner}
          </td>
        </tr>
        <tr>
          <td style="padding:30px 40px;background:#0f172a;text-align:center;">
            <p style="color:#64748b !important;font-size:14px;margin:0;">© 2026 AutoFlow Studio. All rights reserved.</p>
            <p style="color:#475569 !important;font-size:12px;margin-top:10px;">You received this because you contacted us via autoflowstudio.net</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
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

    // ── 3. Lead form submissions (booking / contact) ─────────────────────────
    if (!email || !name) {
      throw new Error(`Missing required lead info: name=${name}, email=${email}`);
    }

    const accessToken = await getAccessToken()


    const adminSubject = "New Lead"
    const adminHtml = `
      <div style="font-family: sans-serif; background: #f9fafb; padding: 20px; border-radius: 8px;">
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
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">AutoFlow Studio</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px; background-color: #1e293b;">
                    <h2 style="color: #f8fafc; margin-top: 0; font-size: 22px; font-weight: 700;">Hello ${name},</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                      Thank you for reaching out to us. We've successfully received your <strong>${type === 'booking' ? 'audit request' : 'message'}</strong>.
                    </p>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                      Our team of automation specialists is currently analyzing your requirements. We aim to provide a detailed response within <strong>24 hours</strong>.
                    </p>
                    <div style="margin: 30px 0; padding: 20px; background: rgba(236, 72, 153, 0.1); border-left: 4px solid #ec4899; border-radius: 8px;">
                      <p style="color: #f8fafc; margin: 0; font-style: italic;">
                        "Automating the present to secure your future."
                      </p>
                    </div>
                    <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; width: 100%;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(to right, #ec4899, #8b5cf6);">
                          <a href="https://autoflowstudio.net/portfolio" target="_blank" style="padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block;">View Our Recent Projects</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 30px; text-align: center;">
                          <p style="color: #94a3b8; font-size: 15px; margin-bottom: 15px;">
                            Have other questions or want to jump straight into a face-to-face strategy session?
                          </p>
                          <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                            <tr>
                              <td align="center" style="border-radius: 12px; border: 1px solid #ec4899;">
                                <a href="https://neeto.com/call/autoflow" target="_blank" style="padding: 12px 24px; font-size: 15px; font-weight: 600; color: #ec4899; text-decoration: none; display: inline-block;">Book a Strategy Call</a>
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
                  <td style="padding: 30px 40px; background-color: #0f172a; text-align: center;">
                    <p style="color: #64748b; font-size: 14px; margin: 0;">
                      &copy; 2026 AutoFlow Studio. All rights reserved.
                    </p>
                    <p style="color: #475569; font-size: 12px; margin-top: 10px;">
                      You received this email because you contacted us through autoflowstudio.net
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

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
