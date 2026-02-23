import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { prompt, mode = "generate", text, targetLanguage } = body
    
    // Validate based on mode
    if (mode === "translate") {
      if (!text || !targetLanguage) {
        return NextResponse.json({ error: "text and targetLanguage are required for translation" }, { status: 400 })
      }
    } else if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // ── GENERATE SCRIPT mode ──────────────────────────────────────────────────
    if (mode === "generate") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional screenwriter and script consultant. Generate a complete, well-structured movie script based on the user's description.

The script should include:
- Proper screenplay formatting (INT./EXT., character names in caps, action lines, dialogue)
- Scene headings with location and time of day
- Character introductions and development
- Clear story structure (setup, conflict, resolution)
- Engaging dialogue
- Visual descriptions and action sequences
- Proper pacing and scene transitions

Format the script in standard screenplay format. Be creative, engaging, and professional.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      })

      const script = completion.choices[0]?.message?.content || "Failed to generate script."
      return NextResponse.json({ script })
    }

    // ── PARSE SCRIPT mode ─────────────────────────────────────────────────────
    if (mode === "parse") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a script analysis AI. Parse the provided screenplay and extract structured data.

Return a JSON object with:
{
  "characters": [
    {
      "name": "Character Name",
      "description": "Brief character description based on script",
      "prompt": "AI image generation prompt for this character"
    }
  ],
  "environments": [
    {
      "name": "Location Name",
      "description": "Description of the location",
      "prompt": "AI image generation prompt for this environment"
    }
  ],
  "objects": [
    {
      "name": "Object Name",
      "description": "Description of the object",
      "prompt": "AI image generation prompt for this object"
    }
  ],
  "scenes": [
    {
      "name": "Scene Name",
      "description": "Scene description",
      "characterNames": ["Character 1", "Character 2"],
      "objectNames": ["Object 1"],
      "environmentName": "Environment Name",
      "shots": [
        {
          "description": "Shot description",
          "cameraAngle": "Eye Level|High Angle|Low Angle|etc",
          "shotType": "Wide Shot (WS)|Medium Shot (MS)|Close-Up (CU)|etc",
          "lighting": "Natural Light|High Key|Low Key|etc",
          "cameraMovement": "Static|Pan|Tilt|Dolly|etc",
          "prompt": "AI image generation prompt for this shot"
        }
      ]
    }
  ]
}

Extract ALL characters, environments, objects, scenes, and shots from the script. Be thorough and detailed.`,
          },
          { role: "user", content: `Parse this script:\n\n${prompt}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4000,
      })

      const data = JSON.parse(completion.choices[0]?.message?.content || "{}")
      return NextResponse.json(data)
    }

    // ── TRANSLATE mode ────────────────────────────────────────────────────────
    if (mode === "translate") {
      const { targetLanguage, text } = body
      if (!targetLanguage || !text) {
        return NextResponse.json({ error: "targetLanguage and text are required" }, { status: 400 })
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional translator specializing in screenplay and script translation. Translate the provided text to ${targetLanguage} while maintaining the tone, style, and formatting of the original.

For scripts, preserve:
- Scene headings format
- Character name formatting
- Action line style
- Dialogue authenticity

Provide a natural, culturally appropriate translation.`,
          },
          { role: "user", content: `Translate this to ${targetLanguage}:\n\n${text}` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      })

      const translation = completion.choices[0]?.message?.content || "Translation failed."
      return NextResponse.json({ translation })
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  } catch (error) {
    console.error("Story script API failed:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
