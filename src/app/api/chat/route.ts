import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function buildContext(context: any[]): string {
  return context
    .map((p: any) => `[Page ${p.pageNumber}${p.title ? `: ${p.title}` : ""}]\n${stripHtml(p.content || "")}`)
    .join("\n\n---\n\n")
}

// POST /api/chat
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { notebookId, message, mode = "chat", context = [] } = body
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })

    const notebookContext = buildContext(context)

    // ── SEARCH mode ──────────────────────────────────────────────────────────
    if (mode === "search") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a search assistant for a digital notebook. Search the notebook content below and find pages that match the user's query.
Return a JSON object with:
- "response": a short sentence describing what you found
- "sources": array of { pageNumber, title, snippet } for matching pages (up to 5)
- "navigateTo": the single most relevant page number (integer), or null

NOTEBOOK CONTENT:
${notebookContext}`,
          },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 800,
      })
      const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
      return NextResponse.json({
        response: data.response || "Here are the pages I found:",
        sources: (data.sources || []).map((s: any) => ({
          pageNumber: s.pageNumber,
          title: s.title || "",
          snippet: s.snippet || "",
        })),
        navigateTo: data.navigateTo || null,
      })
    }

    // ── WRITE mode ───────────────────────────────────────────────────────────
    if (mode === "write") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a creative writing assistant for a digital notebook called smartDigitalNotes.
The user wants you to generate content to be written into their notebook pages.
Return a JSON object with:
- "response": a short confirmation message (e.g. "Here's the story I wrote for you!")
- "writtenPages": array of { pageNumber, title, content } — split long content across multiple pages (max ~400 words per page). Start from page ${(context.length || 0) + 1}.

Write engaging, well-structured content. Use plain text (no markdown) since it will go into a text editor.`,
          },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 2000,
      })
      const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
      return NextResponse.json({
        response: data.response || "Here's the content I generated:",
        writtenPages: data.writtenPages || [],
      })
    }

    // ── CORRECT mode ─────────────────────────────────────────────────────────
    if (mode === "correct") {
      // Check if user mentioned a page number
      const pageMatch = message.match(/page\s*(\d+)/i)
      let textToCorrect = message
      let pageRef: number | null = null

      if (pageMatch) {
        pageRef = parseInt(pageMatch[1])
        const page = context.find((p: any) => p.pageNumber === pageRef)
        if (page) textToCorrect = stripHtml(page.content || "")
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a grammar and spelling correction assistant. Fix all grammar, spelling, punctuation, and style issues in the provided text while preserving the original meaning and tone.
Return a JSON object with:
- "response": a brief note about what was corrected
- "corrected": the fully corrected text (plain text, no markdown)`,
          },
          { role: "user", content: `Please correct this text:\n\n${textToCorrect}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1500,
      })
      const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
      return NextResponse.json({
        response: data.response || "Here's the corrected text:",
        corrected: data.corrected || "",
        navigateTo: pageRef,
      })
    }

    // ── SUMMARIZE mode ───────────────────────────────────────────────────────
    if (mode === "summarize") {
      const input = message.trim()
      const isYT = /youtube\.com|youtu\.be/i.test(input)
      const isWebUrl = /^https?:\/\//i.test(input)

      let fetchedTitle = ""
      let fetchedContent = ""
      let sourceType: "youtube" | "web" | "text" = "text"

      // ── YouTube: use oEmbed to get real title + description ──
      if (isYT) {
        sourceType = "youtube"
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(input)}&format=json`
          const oRes = await fetch(oembedUrl, { headers: { "User-Agent": "Mozilla/5.0" } })
          if (oRes.ok) {
            const oData = await oRes.json()
            fetchedTitle = oData.title || ""
            fetchedContent = `Video title: ${oData.title || ""}\nChannel: ${oData.author_name || ""}\nURL: ${input}`
          }
        } catch {}
        // If oEmbed failed, extract video ID from URL as fallback label
        if (!fetchedTitle) {
          const idMatch = input.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
          fetchedTitle = idMatch ? `YouTube video ${idMatch[1]}` : "YouTube video"
          fetchedContent = `YouTube URL: ${input}`
        }
      }

      // ── Web URL: fetch page HTML and extract text ──
      else if (isWebUrl) {
        sourceType = "web"
        try {
          const pageRes = await fetch(input, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; SmartNoteBot/1.0)" },
            signal: AbortSignal.timeout(8000),
          })
          if (pageRes.ok) {
            const html = await pageRes.text()
            // Extract title tag
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            fetchedTitle = titleMatch ? titleMatch[1].trim() : ""
            // Extract meta description
            const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
              || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
            const metaDesc = metaMatch ? metaMatch[1].trim() : ""
            // Strip all HTML tags and collapse whitespace, take first ~4000 chars
            const text = html
              .replace(/<script[\s\S]*?<\/script>/gi, " ")
              .replace(/<style[\s\S]*?<\/style>/gi, " ")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 8000)
            fetchedContent = [
              fetchedTitle ? `Page title: ${fetchedTitle}` : "",
              metaDesc ? `Description: ${metaDesc}` : "",
              `URL: ${input}`,
              `Content: ${text}`,
            ].filter(Boolean).join("\n\n")
          }
        } catch {}
        if (!fetchedContent) {
          fetchedContent = `Web URL: ${input}`
        }
      }

      // ── Plain text / document ──
      else {
        sourceType = "text"
        fetchedContent = input
        fetchedTitle = input.slice(0, 80)
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a thorough research summarization assistant. The user has provided real content from a source. Produce a detailed, well-structured summary based ONLY on the actual content provided — do NOT invent or hallucinate information.

Return a JSON object with:
- "title": the actual title of this source (string)
- "summary": a rich 4-6 sentence overview that covers the main topic, key arguments, context, and significance of the source (string)
- "sections": array of { heading: string, content: string } — produce 6-10 sections. Each section "content" must be 3-5 sentences long, covering a distinct aspect: background/context, main arguments, supporting evidence, methodology (if any), key findings, implications, strengths, limitations, and takeaways. Make each section substantive and informative.
- "keyPoints": array of strings — 8-12 detailed bullet points, each a full sentence capturing a specific insight, fact, or argument from the source
- "sourceType": "${sourceType}"

Be thorough. Longer, richer content is preferred over brief summaries.`,
          },
          {
            role: "user",
            content: `Here is the actual content to summarize:\n\n${fetchedContent}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 4000,
      })
      const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
      return NextResponse.json({
        title: data.title || fetchedTitle || "Untitled Source",
        summary: data.summary || "",
        sections: data.sections || [],
        keyPoints: data.keyPoints || [],
        sourceType: data.sourceType || sourceType,
      })
    }

    // ── TRIP_PLAN mode ────────────────────────────────────────────────────────
    if (mode === "trip_plan") {
      const { planType, destination, source, days, travelers, budget, currency, dayNumber, date } = body
      
      const { existingItems = [] } = body

      if (planType === "flights") {
        const exclusion = existingItems.length > 0
          ? `\n\nDo NOT suggest any of these already-shown flights: ${existingItems.join(", ")}. Suggest completely different airlines and flight numbers.`
          : ""
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a travel expert. Suggest realistic flight options between two cities.
Return ONLY valid JSON:
{
  "flights": [
    {
      "airline": "Airline Name",
      "flightNumber": "XX 123",
      "departure": "HH:MM",
      "arrival": "HH:MM",
      "duration": "Xh Ym",
      "stops": 0,
      "price": 250,
      "class": "Economy",
      "url": "https://www.google.com/travel/flights/search?q=flights+from+SOURCE+to+DESTINATION",
      "bookingTip": "Book 6-8 weeks in advance for best prices"
    }
  ]
}
Provide 4-5 varied options (different airlines, times, price points). Use real airline names. Generate realistic Google Flights search URLs.`
          }, {
            role: "user",
            content: `Flights from ${source} to ${destination} for ${travelers} traveler(s). Budget: ${budget} ${currency} total.${exclusion}`
          }],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 1500,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      if (planType === "hotels") {
        const exclusion = existingItems.length > 0
          ? `\n\nDo NOT suggest any of these already-shown hotels: ${existingItems.join(", ")}. Suggest completely different hotels.`
          : ""
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a travel expert. Suggest real hotels in the destination city.
Return ONLY valid JSON:
{
  "hotels": [
    {
      "name": "Hotel Name",
      "stars": 4,
      "area": "City center / neighborhood",
      "pricePerNight": 120,
      "highlights": ["Free WiFi", "Pool", "Breakfast included"],
      "rating": 8.5,
      "url": "https://www.booking.com/search.html?ss=HOTEL+NAME+CITY",
      "description": "Brief 1-sentence description"
    }
  ]
}
Provide 5 varied options (budget to luxury). Use real hotel names where possible. Generate realistic Booking.com search URLs.`
          }, {
            role: "user",
            content: `Hotels in ${destination} for ${days} nights, ${travelers} guest(s). Budget: ${budget} ${currency} total trip budget.${exclusion}`
          }],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 1500,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      if (planType === "restaurants") {
        const exclusion = existingItems.length > 0
          ? `\n\nDo NOT suggest any of these already-shown restaurants: ${existingItems.join(", ")}. Suggest completely different restaurants.`
          : ""
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a food and travel expert. Suggest real restaurants in the destination city.
Return ONLY valid JSON:
{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Italian / Local / etc",
      "area": "Neighborhood",
      "priceRange": "$$",
      "mustTry": "Signature dish name",
      "rating": 4.5,
      "url": "https://www.tripadvisor.com/Search?q=RESTAURANT+NAME+CITY",
      "description": "Brief 1-sentence description"
    }
  ]
}
Provide 6-8 varied options across different cuisines and price ranges. Use real restaurant names where possible.`
          }, {
            role: "user",
            content: `Best restaurants in ${destination} for ${travelers} person(s).${exclusion}`
          }],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 1500,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      if (planType === "itinerary_day") {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a travel expert. Plan a complete day itinerary for a traveler.
The day must flow logically: morning hotel → travel → attractions → lunch → attractions → dinner → back to hotel.
Return ONLY valid JSON:
{
  "activities": [
    {
      "time": "08:00",
      "title": "Activity name",
      "location": "Specific place name",
      "category": "accommodation|transport|food|activity|shopping|other",
      "cost": 25,
      "notes": "Practical tip",
      "url": "https://maps.google.com/?q=PLACE+NAME+CITY",
      "booked": false
    }
  ]
}
Include 6-8 activities. Start with breakfast at hotel, end with return to hotel. Include transport between locations. Use Google Maps URLs for each location.`
          }, {
            role: "user",
            content: `Plan Day ${dayNumber} (${date}) in ${destination} for ${travelers} traveler(s). Budget per day: ${Math.round(Number(budget) / Number(days))} ${currency}.`
          }],
          response_format: { type: "json_object" },
          temperature: 0.6,
          max_tokens: 2000,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      if (planType === "check_this") {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a travel expert. Provide essential reference lists for a trip.
Return ONLY valid JSON:
{
  "importantHotels": [
    { "name": "Hotel Name", "area": "Area", "url": "https://www.booking.com/search.html?ss=HOTEL+CITY" }
  ],
  "importantRestaurants": [
    { "name": "Restaurant Name", "cuisine": "Type", "url": "https://www.tripadvisor.com/Search?q=RESTAURANT+CITY" }
  ],
  "importantPlaces": [
    { "name": "Place Name", "type": "Museum/Park/etc", "url": "https://maps.google.com/?q=PLACE+CITY" }
  ],
  "airways": [
    { "airline": "Airline Name", "routes": "Source → Destination", "url": "https://www.google.com/travel/flights/search?q=flights+from+SOURCE+to+DESTINATION" }
  ]
}
Provide 4-5 items in each category. Use real names and generate realistic search URLs.`
          }, {
            role: "user",
            content: `Trip from ${source} to ${destination} for ${days} days.`
          }],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 2000,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      if (planType === "trains") {
        const exclusion = existingItems.length > 0
          ? `\n\nDo NOT suggest any of these already-shown trains: ${existingItems.join(", ")}. Suggest completely different operators and train services.`
          : ""
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a travel expert. Suggest realistic train options between two cities.
Return ONLY valid JSON:
{
  "trains": [
    {
      "operator": "Train Operator Name",
      "trainName": "Train Name / Number",
      "departure": "HH:MM",
      "arrival": "HH:MM",
      "duration": "Xh Ym",
      "class": "First Class / Second Class / Sleeper",
      "price": 45,
      "amenities": ["WiFi", "Dining car", "Power outlets"],
      "url": "https://www.rome2rio.com/s/SOURCE/DESTINATION",
      "bookingTip": "Book in advance for discounted fares"
    }
  ]
}
Provide 4-5 varied options (different classes, times, price points). Use real train operator names. Generate realistic booking/search URLs (Rome2Rio, Trainline, national rail sites).`
          }, {
            role: "user",
            content: `Trains from ${source} to ${destination} for ${travelers} traveler(s). Budget: ${budget} ${currency} total.${exclusion}`
          }],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 1500,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      if (planType === "packing") {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "system",
            content: `You are a travel expert. Create a packing list.
Return ONLY valid JSON:
{ "items": [{"name": "Item name", "category": "Clothing|Toiletries|Electronics|Documents|Medicine|Other"}] }
Include 15-20 essential items.`
          }, {
            role: "user",
            content: `Packing list for ${days}-day trip to ${destination}.`
          }],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 800,
        })
        const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
        return NextResponse.json(data)
      }

      return NextResponse.json({ error: "Unknown planType" }, { status: 400 })
    }

    // ── RESEARCH_CHAT mode ────────────────────────────────────────────────────
    if (mode === "research_chat") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a research assistant. Answer the user's question based on the provided research sources.
Be specific, cite which source you're drawing from, and provide actionable insights.

SOURCES:
${notebookContext}`,
          },
          ...((body.history || []) as { role: string; content: string }[]).map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: message },
        ],
        temperature: 0.6,
        max_tokens: 1200,
      })
      return NextResponse.json({ response: completion.choices[0]?.message?.content || "I couldn't generate a response." })
    }

    // ── CHAT mode (default) ───────────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant for a digital notebook called smartDigitalNotes.
Answer questions based on the notebook content. When referencing information, mention the page number.
Be concise but thorough.

NOTEBOOK CONTENT:
${notebookContext}`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || "I couldn't generate a response."

    // Extract page references as sources
    const sources: { pageNumber: number; title: string; snippet: string }[] = []
    const pageRegex = /page\s*(\d+)/gi
    let match
    while ((match = pageRegex.exec(response)) !== null) {
      const pageNum = parseInt(match[1])
      const page = context.find((p: any) => p.pageNumber === pageNum)
      if (page && !sources.find((s) => s.pageNumber === pageNum)) {
        sources.push({ pageNumber: pageNum, title: page.title || "", snippet: stripHtml(page.content || "").slice(0, 100) })
      }
    }

    return NextResponse.json({ response, sources: sources.slice(0, 3) })
  } catch (error) {
    console.error("Chat failed:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
