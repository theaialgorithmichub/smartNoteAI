import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MODEL_MAP: Record<string, string> = {
  'gpt-4': 'gpt-4',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'claude-3-opus': 'gpt-4',       // fallback to gpt-4 if Anthropic not configured
  'claude-3-sonnet': 'gpt-4-turbo',
  'gemini-pro': 'gpt-3.5-turbo',
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { systemPrompt, prompt, userInput, model, temperature, maxTokens } = await req.json();

    if (!prompt && !systemPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt?.trim()) {
      messages.push({ role: 'system', content: systemPrompt.trim() });
    }

    // Build the user message: combine the prompt template + user input
    const userMessage = [prompt?.trim(), userInput?.trim()].filter(Boolean).join('\n\n');
    messages.push({ role: 'user', content: userMessage });

    const resolvedModel = MODEL_MAP[model] || 'gpt-4-turbo';
    const start = Date.now();

    const completion = await openai.chat.completions.create({
      model: resolvedModel,
      messages,
      temperature: Math.min(Math.max(temperature ?? 0.7, 0), 2),
      max_tokens: Math.min(maxTokens ?? 2000, 4096),
    });

    const latency = Date.now() - start;
    const choice = completion.choices[0];
    const output = choice?.message?.content ?? '';
    const usage = completion.usage;

    return NextResponse.json({
      output,
      latency,
      tokens: usage?.total_tokens ?? 0,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      model: resolvedModel,
      finishReason: choice?.finish_reason,
    });
  } catch (error: any) {
    console.error('[AI Prompt Studio] Error:', error?.message);
    return NextResponse.json(
      { error: error?.message || 'AI request failed' },
      { status: 500 }
    );
  }
}
