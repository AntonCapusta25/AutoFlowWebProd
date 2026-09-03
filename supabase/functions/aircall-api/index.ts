import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const AIRCALL_API_ID = Deno.env.get('AIRCALL_API_ID') || 'f5faee77fd7497d482376fae85cf85cf'
const AIRCALL_API_TOKEN = Deno.env.get('AIRCALL_API_TOKEN') || '10e3d5746a9e19b1ad96a56463c73842'
const DEFAULT_NUMBER_ID = '1369705' // AutoFlow Studio dialers (+1 888-752-5240)
const DEFAULT_USER_ID = '2055112' // Walid Sabihi

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
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    const body = req.method === 'POST' ? await req.json() : {}

    // 1. Get Aircall User & Number status
    if (path === 'status' || path === 'aircall-api') {
      const res = await fetch('https://api.aircall.io/v1/ping', {
        headers: { 'Authorization': getAuthHeader() }
      })
      const data = await res.json()
      return new Response(JSON.stringify({ success: true, ping: data, user_id: DEFAULT_USER_ID, number_id: DEFAULT_NUMBER_ID }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // 2. Start an Outbound Call via Aircall API
    if (path === 'dial') {
      const { phone, leadName } = body
      if (!phone) throw new Error('Missing required field: phone')

      console.log(`[aircall-api] Initiating call to ${phone} for lead: ${leadName || 'Unknown'}`)

      // Call Aircall API to trigger call for user
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
      console.log('[aircall-api] Dial response:', dialData)

      return new Response(JSON.stringify({ success: true, data: dialData }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // 3. Fetch Recent Aircall Calls
    if (path === 'calls') {
      const callsRes = await fetch('https://api.aircall.io/v1/calls?order=desc&per_page=20', {
        headers: { 'Authorization': getAuthHeader() }
      })
      const callsData = await callsRes.json()
      return new Response(JSON.stringify({ success: true, calls: callsData.calls || [] }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    // 4. Create/Sync Contact in Aircall
    if (path === 'sync-contact') {
      const { name, phone, email, company } = body
      if (!phone) throw new Error('Missing required field: phone')

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
      return new Response(JSON.stringify({ success: true, contact: contactData.contact }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 404,
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
