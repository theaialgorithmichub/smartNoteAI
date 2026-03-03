import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Note E, a friendly AI assistant for SmartNote AI - a digital notebook platform.
Your role is to help visitors learn about SmartNote AI features, pricing, and how to get started.

Key information:
- SmartNote AI offers AI-powered note-taking with smart search, auto-organization, and beautiful templates
- Free tier available to get started
- Premium plans start at $9.99/month with advanced AI features, unlimited notebooks, and priority support
- Users can create digital notebooks with the nostalgic feel of physical ones
- Features include: AI-powered search, auto-categorization, notebook templates, collaborative tools, and AI research assistant

Be helpful, concise, and friendly. If asked about features not mentioned above, politely explain what SmartNote AI does offer.`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || "I couldn't generate a response."

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Public chat failed:", error)
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    )
  }
}
