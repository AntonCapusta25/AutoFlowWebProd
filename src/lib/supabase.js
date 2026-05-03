import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars not set. Forms will not submit to database.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Helper: trigger Gmail notification via Edge Function
export async function sendEmailNotification(payload) {
  const edgeUrl = import.meta.env.VITE_SENDGRID_EDGE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!edgeUrl) {
    console.warn('⚠️ Edge Function URL not set in .env')
    return
  }

  try {
    console.log('📨 Triggering email Edge Function...', edgeUrl)
    const res = await fetch(edgeUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey 
      },
      body: JSON.stringify(payload),
    })
    
    if (!res.ok) {
      const errText = await res.text()
      console.error(`❌ Edge Function failed (${res.status}):`, errText)
    } else {
      console.log('✅ Edge Function call successful!')
    }
  } catch (err) {
    console.error('❌ Edge Function network error:', err)
  }
}
