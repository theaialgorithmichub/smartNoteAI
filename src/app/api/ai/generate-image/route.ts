import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // DALL-E 2 supports 512x512 and 1024x1024; use 512 for faster/cheaper generation
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt.trim(),
      n: 1,
      size: "512x512",
      response_format: "url",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL in response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error: unknown) {
    console.error("Generate image error:", error);

    const message = error instanceof Error ? error.message : "Failed to generate image";
    const status = error instanceof Error && "status" in error ? (error as { status?: number }).status : 500;

    return NextResponse.json(
      { error: message },
      { status: typeof status === "number" ? status : 500 }
    );
  }
}
