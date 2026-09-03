import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const AIRCALL_API_ID = Deno.env.get('AIRCALL_API_ID') || 'f5faee77fd7497d482376fae85cf85cf'
const AIRCALL_API_TOKEN = Deno.env.get('AIRCALL_API_TOKEN') || '10e3d5746a9e19b1ad96a56463c73842'
const DEFAULT_NUMBER_ID = 1369705 // AutoFlow Studio dialers (+1 888-752-5240)
const DEFAULT_USER_ID = 2055112 // Walid Sabihi

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getAuthHeader() {
  const b64 = btoa(`${AIRCALL_API_ID}:${AIRCALL_API_TOKEN}`)
  return `Basic ${b64}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const body = req.method === 'POST' ? await req.json() : {}
    const phone = body.phone
    const action = body.action || 'dial'

    console.log(`[aircall-api] Action=${action}, phone=${phone}`)

    // Direct Automatic Outbound Dial via Aircall API
    if (phone || action === 'dial') {
      if (!phone) throw new Error('Missing required field: phone')

      console.log(`[aircall-api] Triggering automatic call to ${phone} via Aircall API...`)

      const dialRes = await fetch(`https://api.aircall.io/v1/users/${DEFAULT_USER_ID}/calls`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: phone,
          number_id: DEFAULT_NUMBER_ID
        })
      })

      const dialData = await dialRes.json()
      console.log('[aircall-api] Aircall API Dial Response:', JSON.stringify(dialData))

      return new Response(JSON.stringify({ success: true, data: dialData }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // Sync Contact to Aircall
    if (action === 'sync-contact') {
      const { name, email, company } = body
      const contactRes = await fetch('https://api.aircall.io/v1/contacts', {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: name || 'Lead',
          company_name: company || 'AutoFlow Lead',
          phone_numbers: [{ label: 'work', value: phone }],
          emails: email ? [{ label: 'work', value: email }] : []
        })
      })
      const contactData = await contactRes.json()
      return new Response(JSON.stringify({ success: true, contact: contactData }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  } catch (err: any) {
    console.error('[aircall-api] Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
})
