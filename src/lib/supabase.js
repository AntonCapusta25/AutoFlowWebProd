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
// Uses supabase.functions.invoke — no separate env var needed,
// works in all environments as long as VITE_SUPABASE_URL is set.
export async function sendEmailNotification(payload) {
  try {
    console.log('📨 Triggering email Edge Function...', payload.type)
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    })
    if (error) {
      console.error('❌ Edge Function error:', error)
    } else {
      console.log('✅ Edge Function call successful!', data)
    }
  } catch (err) {
    console.error('❌ Edge Function network error:', err)
  }
}

