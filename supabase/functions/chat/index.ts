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
    const { message, history = [] } = body

    if (!message) {
      throw new Error('Missing "message" in request body')
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
Your goal is to answer client questions about AutoFlow Studio, our services (custom automation, workflow optimization, AI chatbots, CRM integrations), and pricing.

Here is the database information about AutoFlow Studio:
${knowledgeContext}

CRITICAL RULES & GUARDRAILS:
1. Topic Limitation: You are strictly an assistant for AutoFlow Studio's automation services.
2. If the user asks anything off-topic, unrelated to business automation, software, or AutoFlow Studio (for example, "I want to buy a car for my IT agency", planning personal travel, cooking recipes, math tasks, or general personal chit-chat), you MUST block the request. You MUST reply exactly and only with:
"Look, that's not possible here, but let's speak about automations. What can I help you with?"
Do not answer the off-topic question under any circumstances.
3. Keep your answers concise, structured, and easy to read. Use bullet points where appropriate.
4. If a user wants to book an appointment or strategy session, encourage them to click the "Book a Call" button or help them schedule it.`;

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

    // 5. Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('[chatbot] Calling Gemini API...')
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.2, // Lower temperature to follow instructions strictly
          maxOutputTokens: 1000
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Gemini API returned error ${response.status}: ${JSON.stringify(data)}`)
    }

    // Extract text from Gemini response structure
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."

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
