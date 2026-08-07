import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import webpush from 'npm:web-push@3.6.7'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment configuration keys: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json()
    const { chat_id, message, sender_name } = body

    if (!chat_id) {
      throw new Error('Missing "chat_id" in request payload')
    }

    // Configure VAPID details
    webpush.setVapidDetails(
      'mailto:info@autoflowstudio.net',
      'BMRGPuIAhWNgBJBQ9ujr68axC3x5WRJ4r7d3NshX805pve5v5YE4tpyjzJSn3eBKPv1JpxH7WroyrVN83Gb5rkc',
      'xdj4AnKDskK9hI6BzMKZLXj4P0t_76hSiGH_nmPE_Wg'
    )

    // Fetch all active push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('admin_push_subscriptions')
      .select('id, user_id, subscription')

    if (fetchError) {
      throw new Error(`Failed to fetch push subscriptions from database: ${fetchError.message}`)
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[send-push-notification] No active admin push subscriptions registered. Skipping dispatch.')
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    console.log(`[send-push-notification] Dispatching web push notification to ${subscriptions.length} subscribers...`)

    const notificationPayload = JSON.stringify({
      title: `${sender_name || 'Customer'} needs support`,
      body: message || 'New support message received.',
      url: `/admin/chat?chat_id=${chat_id}`
    })

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, notificationPayload)
          return { id: sub.id, status: 'sent' }
        } catch (err) {
          console.error(`[send-push-notification] Failed to send to subscriber ${sub.id}:`, err)
          
          // Clean up invalid or expired subscriptions (404 Not Found or 410 Gone)
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log(`[send-push-notification] Subscription ${sub.id} is invalid/expired. Deleting from database...`)
            await supabase
              .from('admin_push_subscriptions')
              .delete()
              .eq('id', sub.id)
            return { id: sub.id, status: 'deleted_expired' }
          }
          return { id: sub.id, status: 'failed', error: err.message }
        }
      })
    )

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (err) {
    console.error('[send-push-notification] ERROR:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
