import Deno from 'https://deno.land/std@0.177.0/node/module.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'noreply@autoflowstudio.net'
const TO_EMAIL = Deno.env.get('SENDGRID_TO_EMAIL') ?? 'autoflowcompany2025@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const body = await req.json()
    const { type, name, email, company, message, service, size, platform } = body

    const subject = type === 'booking'
      ? `🚀 New Booking Request from ${name}`
      : `📬 New Contact Message from ${name}`

    const html = type === 'booking' ? `
      <h2>New Booking Lead</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Business Size:</strong> ${size}</p>
      <p><strong>Platform:</strong> ${platform || 'N/A'}</p>
    ` : `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: TO_EMAIL }] }],
        from: { email: FROM_EMAIL, name: 'AutoFlow Studio' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    })

    if (!res.ok) throw new Error(`SendGrid error: ${res.status}`)

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
