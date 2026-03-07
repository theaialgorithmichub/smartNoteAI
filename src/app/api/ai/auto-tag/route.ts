import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import connectDB from '@/lib/mongodb';
import { Notebook } from '@/lib/models/notebook';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { notebookId, content, title } = await req.json();
    if (!content && !title) return NextResponse.json({ error: 'Content or title required' }, { status: 400 });

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are a tagging and categorization expert. Analyze the given note content and return:
1. tags: 3-7 relevant lowercase tags (single words or short phrases)
2. category: one of productivity, creative, business, education, personal, research, other
3. summary: one sentence summary (max 120 chars)

Return as JSON: { "tags": [...], "category": "...", "summary": "..." }`,
        },
        {
          role: 'user',
          content: `Title: ${title || ''}\n\nContent: ${(content || '').slice(0, 2000)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const tags: string[] = result.tags || [];
    const category: string = result.category || 'other';
    const summary: string = result.summary || '';

    // Optionally persist tags to the notebook
    if (notebookId) {
      await connectDB();
      await Notebook.findOneAndUpdate(
        { _id: notebookId, userId },
        { $set: { tags, category } },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, tags, category, summary });
  } catch (error: any) {
    console.error('Error auto-tagging:', error);
    return NextResponse.json({ error: error.message || 'Failed to auto-tag' }, { status: 500 });
  }
}
