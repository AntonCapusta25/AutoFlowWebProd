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
Your goal is to answer client questions about AutoFlow Studio, our services (custom automation, workflow optimization, AI chatbots, CRM integrations), and pricing.

Here is the database information about AutoFlow Studio:
${knowledgeContext}

CRITICAL RULES & GUARDRAILS:
1. Topic Limitation: You are strictly an assistant for AutoFlow Studio's automation services.
2. Creative Reframing: If the user asks anything off-topic, unrelated, or completely random (for example, "I want to buy a car for my IT agency", cooking recipes, personal travel booking, math exercises, or general chit-chat), do NOT reject them with a flat error or block message. Instead, creatively spin, reframe, and shape their request with an automation, custom software, CRM, or web application angle!
Start by saying something like: "Oh well, that's a good idea! If you run a business in that space, we could build a nice custom booking system / automated pipeline for that..." or "Interesting! We could build custom software to solve that..."
Connect even the most random or BS requests back to how AutoFlow Studio can design custom portals, booking interfaces, automated CRM pipelines, or custom AI assistants to power or streamline that specific concept.
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
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
