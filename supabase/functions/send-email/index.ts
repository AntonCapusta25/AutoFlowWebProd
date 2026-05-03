// Supabase Edge Function — sends emails via Gmail API
// Deploy: supabase functions deploy send-email
// Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN

const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''
const REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN') ?? ''
const ADMIN_EMAIL = 'autoflowcompany2025@gmail.com'

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`OAuth error: ${data.error_description || data.error}`)
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
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const body = await req.json()
    const { type, name, email, company, message, service, size, platform, recipient, subject: customSubject } = body

    const accessToken = await getAccessToken()

    // 1. Handle Campaigns (Single email to recipient)
    if (type === 'campaign') {
      const raw = createRawMessage(recipient, customSubject || 'Update from AutoFlow Studio', message)
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      })
      if (!res.ok) throw new Error(`Gmail Campaign error: ${res.status}`)
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
    }

    // 2. Handle Leads (Two emails: Admin Notification + Customer Auto-Reply)
    if (!email || !name) {
      throw new Error(`Missing required lead info: name=${name}, email=${email}`);
    }

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

    // Send to Customer
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

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
