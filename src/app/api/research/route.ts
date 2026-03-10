import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// POST /api/research - AI Research Agent with web search
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { notebookId, message } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Step 1: Search the web using Tavily API
    let webResults = []
    try {
      const tavilyResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: message,
          search_depth: "advanced",
          include_answer: true,
          include_raw_content: false,
          max_results: 5,
        }),
      })

      if (tavilyResponse.ok) {
        const tavilyData = await tavilyResponse.json()
        webResults = tavilyData.results || []
      }
    } catch (error) {
      console.error("Tavily search failed:", error)
    }

    // Step 2: Synthesize research with GPT-4
    const webContext = webResults
      .map((result: any, i: number) => {
        return `[Source ${i + 1}: ${result.title}]\nURL: ${result.url}\n${result.content}`
      })
      .join("\n\n---\n\n")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a research assistant for smartDigitalNotes, a digital notebook application.

Your task is to synthesize information from web search results into a well-organized research summary that can be added to the user's notebook.

Format your response as a structured note with:
1. A clear title/heading
2. Key findings organized with bullet points or numbered lists
3. Important quotes or data points
4. Source citations

Make the content suitable for a notebook page - informative, well-organized, and easy to read.

WEB SEARCH RESULTS:
${webContext || "No web results available. Please provide a general overview based on your knowledge."}`,
        },
        {
          role: "user",
          content: `Research topic: ${message}

Please provide a comprehensive research summary on this topic.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content || "I couldn't complete the research."

    // Include sources in response
    const sources = webResults.slice(0, 3).map((result: any) => ({
      title: result.title,
      url: result.url,
    }))

    return NextResponse.json({ 
      response, 
      sources,
      canAddToNotebook: true,
    })
  } catch (error) {
    console.error("Research failed:", error)
    return NextResponse.json(
      { error: "Failed to complete research" },
      { status: 500 }
    )
  }
}
