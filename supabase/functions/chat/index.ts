import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in Supabase secrets. Please set it using: supabase secrets set GEMINI_API_KEY=your_key')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Parse request body
    const body = await req.json()
    const { message, chat_id, history = [] } = body

    if (!message) {
      throw new Error('Missing "message" in request body')
    }

    // Trigger GDPR cleanup once in a while (5% probability)
    if (Math.random() < 0.05) {
      console.log('[chatbot] Running GDPR cleanup...')
      await supabase.rpc('cleanup_old_customer_chats')
    }

    // If chat_id is passed, verify that status is not 'human'
    if (chat_id) {
      const { data: chatData, error: chatError } = await supabase
        .from('customer_chats')
        .select('status')
        .eq('id', chat_id)
        .maybeSingle()

      if (chatError) {
        console.error('[chatbot] Error checking chat status:', chatError)
      }

      if (chatData?.status === 'human') {
        console.log('[chatbot] Human agent has taken over. Bot will not respond.')
        return new Response(JSON.stringify({ reply: '' }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        })
      }
    }

    // 2. Query company knowledge base from database
    console.log('[chatbot] Querying knowledge base...')
    const { data: knowledge, error: dbError } = await supabase
      .from('company_knowledge')
      .select('title, content')

    if (dbError) {
      console.error('[chatbot] Database error fetching knowledge:', dbError)
    }

    // Format the knowledge base content as a text block
    let knowledgeContext = 'No company database information is currently loaded.'
    if (knowledge && knowledge.length > 0) {
      knowledgeContext = knowledge.map(entry => {
        return `=== DOCUMENT: ${entry.title} ===\n${entry.content}\n`
      }).join('\n');
    }

    // 3. Define the guardrails and system instructions
    const systemInstruction = `You are a helpful, professional, and friendly AI chatbot for AutoFlow Studio (autoflowstudio.net).
Your goal is to assist clients, answer questions about AutoFlow Studio, our services (custom automations, workflow optimization, AI agents, CRM integrations), and help them get started.

Here is the database information about AutoFlow Studio:
${knowledgeContext}

CRITICAL RULES & GUARDRAILS:
1. Greetings & Small Talk: ALWAYS respond warmly, naturally, and enthusiastically to greetings like "hi", "hello", "hey", "good morning", "how are you", etc. Introduce yourself as AutoFlow Studio's AI assistant and ask how you can help automate their business or workflows today.
2. Core Focus: You specialize in AutoFlow Studio's automation services, custom software, CRM pipelines, and AI systems.
3. Unrelated Off-Topic Requests: If the user asks about completely unrelated subjects (such as cooking recipes, buying cars, solving math homework, or sports scores), politely and creatively steer the conversation back to how AutoFlow Studio can help build custom software or automations for their business. Never be dismissive or say "that's not possible here".
4. Formatting: Keep your answers concise, structured, professional, and easy to read.
5. Call to Action: If a user expresses interest in starting a project or learning more, encourage them to book a free 15-minute Discovery Call or contact us.`;

    // 4. Map the conversation history to the Gemini format
    // Gemini roles: 'user' or 'model'
    const contents = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // 5. Call Gemini API (Try latest Gemini 3.8 Flash, fallback to 3.5 or 2.5)
    const MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']
    let data = null
    let lastError = null

    for (const model of MODELS) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
      console.log(`[chatbot] Calling Gemini API (${model})...`)
      try {
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000
            }
          })
        })
        const resJson = await response.json()
        if (response.ok && resJson.candidates?.[0]?.content?.parts?.[0]?.text) {
          data = resJson
          break
        }
        lastError = resJson.error?.message || `HTTP ${response.status}`
        console.warn(`[chatbot] Model ${model} failed:`, lastError)
      } catch (err) {
        lastError = err.message
        console.warn(`[chatbot] Model ${model} exception:`, err.message)
      }
    }

    if (!data) {
      throw new Error(`All Gemini models failed. Last error: ${lastError}`)
    }

    // Extract text from Gemini response structure
    const replyText = data.candidates[0].content.parts[0].text

    // Save bot response to database if chat_id is provided
    if (chat_id) {
      console.log('[chatbot] Saving bot response to customer_messages table...')
      const { error: msgError } = await supabase
        .from('customer_messages')
        .insert([{
          chat_id,
          sender_type: 'bot',
          content: replyText
        }])
      
      if (msgError) {
        console.error('[chatbot] Error inserting bot reply:', msgError)
      } else {
        // Update updated_at on the chat session
        await supabase
          .from('customer_chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chat_id)
      }
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    })

  } catch (err) {
    console.error('[chatbot] ERROR:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
})
