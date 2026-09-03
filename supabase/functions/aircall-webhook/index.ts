import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload = await req.json()
    console.log('[aircall-webhook] Received event:', payload.event, payload.data?.id)

    const event = payload.event
    const data = payload.data || {}

    // We process call.ended or call.created events
    if (event === 'call.ended' || event === 'call.created') {
      const rawNumber = data.raw_digits || data.number?.digits || data.user?.phone_number || ''
      const duration = data.duration || 0 // seconds
      const status = data.status || 'ended'
      const direction = data.direction || 'outbound'
      const recordingUrl = data.recording || null
      const agentName = data.user?.name || data.user?.email || 'Aircall Agent'

      if (rawNumber) {
        const cleanPhone = rawNumber.replace(/[^0-9+]/g, '')

        // Find matching lead in outreach_leads
        const { data: lead } = await supabase
          .from('outreach_leads')
          .select('id, comments, call_history')
          .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone.replace('+', '')}%`)
          .maybeSingle()

        if (lead) {
          const durationStr = duration > 0 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '0s'
          const noteText = `📞 Aircall ${direction} call (${status}): ${durationStr} by ${agentName}.${recordingUrl ? ` Recording: ${recordingUrl}` : ''}`

          // Append to lead comments
          const updatedComments = lead.comments ? `${lead.comments}\n\n${noteText}` : noteText

          await supabase
            .from('outreach_leads')
            .update({
              comments: updatedComments,
              last_call_at: new Date().toISOString()
            })
            .eq('id', lead.id)

          console.log(`[aircall-webhook] Logged call to lead ${lead.id}`)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  } catch (err: any) {
    console.error('[aircall-webhook] Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
})
